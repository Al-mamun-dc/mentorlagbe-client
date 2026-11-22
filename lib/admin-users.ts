import { headers } from "next/headers"
import { type Document } from "mongodb"

import { auth } from "@/lib/auth"
import type { AdminRole, AdminUser } from "@/lib/api/admin"
import { getDatabase } from "@/lib/db"
import { toObjectId } from "@/lib/object-id"

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

export class AdminUserError extends Error {
  status: 400 | 404 | 409

  constructor(status: 400 | 404 | 409, message: string) {
    super(message)
    this.status = status
  }
}

type BetterAuthUserLike = Record<string, unknown> & { id?: string; _id?: unknown }

function toAdminUser(doc: BetterAuthUserLike, plan: "free" | "pro"): AdminUser {
  const id = typeof doc.id === "string" ? doc.id : String(doc._id ?? "")
  return {
    id,
    name: typeof doc.name === "string" ? doc.name : "",
    email: typeof doc.email === "string" ? doc.email : "",
    role: normalizeRole(doc.role),
    plan,
    createdAt: asTimestamp(doc.createdAt),
  }
}

async function getPlansByUserIds(userIds: string[]): Promise<Map<string, "free" | "pro">> {
  const plans = new Map<string, "free" | "pro">()
  if (userIds.length === 0) return plans

  const objectIds = userIds
    .map((id) => toObjectId(id))
    .filter((id): id is NonNullable<typeof id> => Boolean(id))

  if (objectIds.length === 0) return plans

  const db = await getDatabase()
  const docs = await db
    .collection("user")
    .find({ _id: { $in: objectIds } }, { projection: { _id: 1, plan: 1 } })
    .toArray()

  for (const doc of docs as Document[]) {
    plans.set(String(doc._id), doc.plan === "pro" ? "pro" : "free")
  }

  return plans
}

/** Lists users via Better Auth Admin Plugin API. Enriches with plan from DB. */
export async function listAdminUsers(): Promise<AdminUser[]> {
  const requestHeaders = await headers()
  const allUsers: BetterAuthUserLike[] = []
  const limit = 100
  let offset = 0

  for (;;) {
    const result = await auth.api.listUsers({
      headers: requestHeaders,
      query: {
        limit,
        offset,
      },
    })

    const users = Array.isArray(result?.users)
      ? (result.users as unknown as BetterAuthUserLike[])
      : []
    allUsers.push(...users)

    const total = typeof result?.total === "number" ? result.total : users.length
    offset += users.length
    if (users.length === 0 || offset >= total) break
  }

  const plans = await getPlansByUserIds(
    allUsers.map((u) => (typeof u.id === "string" ? u.id : String(u._id ?? ""))).filter(Boolean)
  )

  return allUsers.map((user) => {
    const id = typeof user.id === "string" ? user.id : String(user._id ?? "")
    return toAdminUser(user, plans.get(id) ?? "free")
  })
}

interface UpdateRoleInput {
  targetUserId: string
  nextRole: AdminRole
  actingAdminId: string
}

/**
 * Updates role via Better Auth Admin Plugin API. Preserves self-demotion and
 * last-admin protections before delegating the role change.
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
    return toAdminUser(target as BetterAuthUserLike, target.plan === "pro" ? "pro" : "free")
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

  const requestHeaders = await headers()
  const result = await auth.api.setRole({
    headers: requestHeaders,
    body: {
      userId: input.targetUserId,
      role: input.nextRole as unknown as "user",
    },
  })

  const updated = (result?.user ?? null) as unknown as BetterAuthUserLike | null
  if (!updated) throw new AdminUserError(404, "User not found.")

  if (normalizeRole(updated.role) !== input.nextRole) {
    throw new Error("Failed to update the user role.")
  }

  return toAdminUser(updated, target.plan === "pro" ? "pro" : "free")
}
