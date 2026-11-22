import { type Document } from "mongodb"

import { getDatabase } from "@/lib/db"
import { toObjectId } from "@/lib/object-id"
import type { AdminRole, AdminUser } from "@/lib/api/admin"

const ALLOWED_ROLES: AdminRole[] = ["student", "tutor", "admin"]

export function parseAdminRole(value: unknown): AdminRole | null {
  return typeof value === "string" && ALLOWED_ROLES.includes(value as AdminRole)
    ? (value as AdminRole)
    : null
}

function asTimestamp(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : null
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value)
    return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : value
  }
  return null
}

function normalizeRole(value: unknown): AdminRole | null {
  return value === "student" || value === "tutor" || value === "admin" ? value : null
}

function toAdminUser(doc: Document): AdminUser {
  return {
    id: String(doc._id),
    name: typeof doc.name === "string" ? doc.name : "",
    email: typeof doc.email === "string" ? doc.email : "",
    role: normalizeRole(doc.role),
    plan: doc.plan === "pro" ? "pro" : "free",
    createdAt: asTimestamp(doc.createdAt),
  }
}

function updatedDocument(result: unknown): Document | null {
  if (!result || typeof result !== "object") return null
  if ("value" in (result as Record<string, unknown>)) {
    const value = (result as { value?: unknown }).value
    return value && typeof value === "object" ? (value as Document) : null
  }
  if ("_id" in (result as Record<string, unknown>)) return result as Document
  return null
}

export class AdminUserError extends Error {
  status: 400 | 404 | 409

  constructor(status: 400 | 404 | 409, message: string) {
    super(message)
    this.status = status
  }
}

/** Returns safe user fields for admin management. No auth/token/Stripe secrets exposed. */
export async function listAdminUsers(): Promise<AdminUser[]> {
  const db = await getDatabase()
  const users = await db
    .collection("user")
    .find(
      {},
      {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          plan: 1,
          createdAt: 1,
        },
      }
    )
    .sort({ createdAt: -1, _id: -1 })
    .toArray()

  return users.map(toAdminUser)
}

interface UpdateRoleInput {
  targetUserId: string
  nextRole: AdminRole
  actingAdminId: string
}

/**
 * Updates only the role field. Preserves all other user data and prevents
 * self-demotion or removal of the final admin account.
 */
export async function updateUserRole(input: UpdateRoleInput): Promise<AdminUser> {
  const targetId = toObjectId(input.targetUserId)
  if (!targetId) throw new AdminUserError(400, "Invalid user ID.")

  const db = await getDatabase()
  const users = db.collection("user")
  const target = await users.findOne(
    { _id: targetId },
    { projection: { _id: 1, name: 1, email: 1, role: 1, plan: 1, createdAt: 1 } }
  )

  if (!target) throw new AdminUserError(404, "User not found.")

  const currentRole = normalizeRole(target.role)
  if (currentRole === input.nextRole) {
    return toAdminUser(target)
  }

  const isSelf = String(targetId) === input.actingAdminId
  if (isSelf && currentRole === "admin" && input.nextRole !== "admin") {
    throw new AdminUserError(409, "You cannot change your own admin role.")
  }

  if (currentRole === "admin" && input.nextRole !== "admin") {
    const adminCount = await users.countDocuments({ role: "admin" })
    if (adminCount <= 1) {
      throw new AdminUserError(409, "Cannot remove the last active admin account.")
    }
  }

  const result = await users.findOneAndUpdate(
    { _id: targetId },
    { $set: { role: input.nextRole, updatedAt: new Date() } },
    {
      returnDocument: "after",
      projection: {
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        plan: 1,
        createdAt: 1,
      },
    }
  )

  const updated = updatedDocument(result)
  if (!updated) throw new AdminUserError(404, "User not found.")

  if (normalizeRole(updated.role) !== input.nextRole) {
    throw new Error("Failed to update the user role.")
  }

  return toAdminUser(updated)
}
