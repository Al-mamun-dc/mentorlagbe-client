import { type Document } from "mongodb"

import { isValidObjectId, toObjectId } from "@/lib/object-id"
import { getDatabase } from "@/lib/db"
import type { AdminTuition, ApprovalStatus } from "@/lib/api/admin-tuition"

/** Kept as a named alias so existing admin tuition routes stay readable. */
export function isValidTuitionId(value: string): boolean {
  return isValidObjectId(value)
}

/** Approval decisions are strict; unknown values are rejected rather than coerced. */
export function parseApprovalStatus(value: unknown): "approved" | "rejected" | null {
  return value === "approved" || value === "rejected" ? value : null
}

function asText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return fallback
}

function asNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function asTimestamp(value: unknown): string | null {
  if (value instanceof Date) {
    const time = value.getTime()
    return Number.isFinite(time) ? value.toISOString() : null
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value)
    return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : value
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = new Date(value)
    return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null
  }

  return null
}

/** MongoDB records include legacy string/number variations, so normalize at the edge. */
function normalizeTuition(document: Document): AdminTuition {
  const mode = asText(document.mode).toLowerCase() === "offline" ? "offline" : "online"
  const rawApproval = asText(document.approvalStatus).toLowerCase()
  const approvalStatus: ApprovalStatus =
    rawApproval === "approved" || rawApproval === "rejected" ? rawApproval : "pending"

  const rawDays = Math.trunc(asNumber(document.daysPerWeek, 1))
  const daysPerWeek = rawDays >= 1 && rawDays <= 7 ? rawDays : 1
  const rawFee = asNumber(document.monthlyFee, 0)

  return {
    id: String(document._id),
    title: asText(document.title),
    subject: asText(document.subject),
    classLevel: asText(document.classLevel),
    tutorName: asText(document.tutorName),
    tutorEmail: asText(document.tutorEmail),
    mode,
    location: mode === "online" ? asText(document.location) || "Online" : asText(document.location),
    monthlyFee: rawFee > 0 ? rawFee : 0,
    daysPerWeek,
    description: asText(document.description),
    approvalStatus,
    isActive: typeof document.isActive === "boolean" ? document.isActive : true,
    tutorStatus: asText(document.tutorStatus, "active"),
    createdAt: asTimestamp(document.createdAt),
    updatedAt: asTimestamp(document.updatedAt),
  }
}

function statusRank(status: ApprovalStatus): number {
  if (status === "pending") return 0
  if (status === "rejected") return 1
  return 2
}

function timestampValue(value: string | null): number {
  if (!value) return 0
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/** Returns the full moderation queue, pending first and newest first within each status. */
export async function listAdminTuitions(): Promise<AdminTuition[]> {
  const db = await getDatabase()
  const documents = await db.collection("tution").find({}).toArray()

  return documents
    .map(normalizeTuition)
    .sort((a, b) => {
      const byStatus = statusRank(a.approvalStatus) - statusRank(b.approvalStatus)
      if (byStatus !== 0) return byStatus

      const byDate =
        timestampValue(b.createdAt ?? b.updatedAt) - timestampValue(a.createdAt ?? a.updatedAt)
      if (byDate !== 0) return byDate

      return a.title.localeCompare(b.title)
    })
}

/** Changes only the approval status and audit timestamp; all other fields stay intact. */
export async function updateTuitionApproval(
  id: string,
  approvalStatus: "approved" | "rejected"
): Promise<AdminTuition | null> {
  const objectId = toObjectId(id)
  if (!objectId) return null

  const db = await getDatabase()
  const updated = await db
    .collection("tution")
    .findOneAndUpdate(
      { _id: objectId },
      { $set: { approvalStatus, updatedAt: new Date() } },
      { returnDocument: "after" }
    )

  return updated ? normalizeTuition(updated) : null
}
