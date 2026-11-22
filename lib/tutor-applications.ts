import { type Document } from "mongodb"

import { getDatabase } from "@/lib/db"
import { toObjectId } from "@/lib/object-id"

export type TutorApplicationStatus = "pending" | "accepted" | "rejected"

export interface TutorApplication {
  id: string
  studentName: string
  studentEmail: string
  studentPhone: string
  preferredSchedule: string
  note: string
  tuitionTitle: string
  status: TutorApplicationStatus
  createdAt: string | null
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function asTimestamp(value: unknown): string | null {
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.toISOString() : null
  if (typeof value === "string" && value.trim()) {
    const d = new Date(value)
    return Number.isFinite(d.getTime()) ? d.toISOString() : value
  }
  return null
}

function normalizeStatus(value: unknown): TutorApplicationStatus {
  const s = asString(value).toLowerCase()
  return s === "accepted" || s === "rejected" ? s : "pending"
}

export function parseTutorApplicationStatus(value: unknown): TutorApplicationStatus | null {
  if (typeof value !== "string") return null
  const s = value.toLowerCase()
  return s === "accepted" || s === "rejected" ? s : null
}

export async function listTutorApplications(tutorId: string): Promise<TutorApplication[]> {
  const db = await getDatabase()
  const tuitions = await db
    .collection("tution")
    .find({ tutorId }, { projection: { _id: 1, title: 1 } })
    .toArray()

  const tuitionIds = tuitions.map((t) => String(t._id))
  if (tuitionIds.length === 0) return []

  const titleById = new Map<string, string>()
  for (const t of tuitions) titleById.set(String(t._id), asString(t.title))

  const docs = await db
    .collection("application")
    .find({ tuitionId: { $in: tuitionIds } })
    .sort({ createdAt: -1, _id: -1 })
    .toArray()

  return docs.map((doc: Document) => {
    const tuitionId = asString(doc.tuitionId)
    return {
      id: String(doc._id),
      studentName: asString(doc.studentName) || "Unknown Student",
      studentEmail: asString(doc.studentEmail) || "Not available",
      studentPhone: asString(doc.phone) || "Not provided",
      preferredSchedule: asString(doc.preferredSchedule) || "Not provided",
      note: asString(doc.learningNote),
      tuitionTitle: asString(doc.tuitionTitle) || titleById.get(tuitionId) || "Tuition unavailable",
      status: normalizeStatus(doc.status),
      createdAt: asTimestamp(doc.createdAt),
    }
  })
}

export class TutorApplicationError extends Error {
  status: 400 | 404 | 403
  constructor(status: 400 | 404 | 403, message: string) {
    super(message)
    this.status = status
  }
}

export async function updateTutorApplicationStatus(input: {
  applicationId: string
  tutorId: string
  status: TutorApplicationStatus
}): Promise<TutorApplication> {
  const appObjectId = toObjectId(input.applicationId)
  if (!appObjectId) throw new TutorApplicationError(400, "Invalid application ID.")

  const db = await getDatabase()
  const appDoc = await db.collection("application").findOne({ _id: appObjectId })
  if (!appDoc) throw new TutorApplicationError(404, "Application not found.")

  const tuitionId = asString(appDoc.tuitionId)
  const tuitionObjectId = toObjectId(tuitionId)
  const tuition = tuitionObjectId
    ? await db.collection("tution").findOne(
        { _id: tuitionObjectId },
        { projection: { tutorId: 1, title: 1 } }
      )
    : null

  if (!tuition || asString(tuition.tutorId) !== input.tutorId) {
    throw new TutorApplicationError(403, "You cannot update this application.")
  }

  const result = await db.collection("application").findOneAndUpdate(
    { _id: appObjectId },
    { $set: { status: input.status } },
    { returnDocument: "after" }
  )

  const updated =
    result && typeof result === "object" && "value" in (result as Record<string, unknown>)
      ? ((result as { value?: unknown }).value as Document | null)
      : (result as Document | null)

  if (!updated) throw new TutorApplicationError(404, "Application not found.")

  return {
    id: String(updated._id),
    studentName: asString(updated.studentName) || "Unknown Student",
    studentEmail: asString(updated.studentEmail) || "Not available",
    studentPhone: asString(updated.phone) || "Not provided",
    preferredSchedule: asString(updated.preferredSchedule) || "Not provided",
    note: asString(updated.learningNote),
    tuitionTitle:
      asString(updated.tuitionTitle) || asString(tuition.title) || "Tuition unavailable",
    status: normalizeStatus(updated.status),
    createdAt: asTimestamp(updated.createdAt),
  }
}
