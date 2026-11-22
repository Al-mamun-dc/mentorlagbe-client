export type ApprovalStatus = "pending" | "approved" | "rejected"

/** A tuition post as shown in the admin approval queue. */
export interface AdminTuition {
  id: string
  title: string
  subject: string
  classLevel: string
  tutorName: string
  tutorEmail: string
  mode: "online" | "offline"
  location: string
  monthlyFee: number
  daysPerWeek: number
  description: string
  approvalStatus: ApprovalStatus
  isActive: boolean
  tutorStatus: string
  createdAt: string | null
  updatedAt: string | null
}

interface ApiError {
  error?: string
}

/** Reads the full moderation queue. Identity and role are checked by the API route. */
export const getAdminTuitions = async (): Promise<AdminTuition[]> => {
  const res = await fetch("/api/admin/tuitions", {
    credentials: "include",
    cache: "no-store",
  })

  const text = await res.text()
  let result: unknown = null

  try {
    result = text ? JSON.parse(text) : null
  } catch {
    result = null
  }

  if (!res.ok) {
    const error = (result as ApiError | null)?.error
    throw new Error(error || `Failed to load tuitions. (HTTP ${res.status})`)
  }

  const data = result as { tuitions?: unknown } | null
  return Array.isArray(data?.tuitions) ? (data.tuitions as AdminTuition[]) : []
}

/** Sets only the approval status of a tuition post. */
export const setTuitionApproval = async (
  tuitionId: string,
  approvalStatus: "approved" | "rejected"
): Promise<AdminTuition> => {
  const res = await fetch(`/api/admin/tuitions/${encodeURIComponent(tuitionId)}/approval`, {
    method: "PATCH",
    credentials: "include",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ approvalStatus }),
  })

  const text = await res.text()
  let result: unknown = null

  try {
    result = text ? JSON.parse(text) : null
  } catch {
    result = null
  }

  if (!res.ok) {
    const error = (result as ApiError | null)?.error
    throw new Error(error || `Failed to update tuition. (HTTP ${res.status})`)
  }

  const tuition = (result as { tuition?: AdminTuition } | null)?.tuition
  if (!tuition) {
    throw new Error("The server did not return the updated tuition.")
  }

  return tuition
}
