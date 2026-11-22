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

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }
  if (!res.ok) {
    const error = (data as { error?: string } | null)?.error
    throw new Error(error || `Request failed. (HTTP ${res.status})`)
  }
  return data as T
}

export async function getTutorApplications(): Promise<TutorApplication[]> {
  const res = await fetch("/api/tutor/applications", {
    credentials: "include",
    cache: "no-store",
  })
  const data = await readJson<{ applications?: TutorApplication[] }>(res)
  return Array.isArray(data.applications) ? data.applications : []
}

export async function updateTutorApplicationStatus(
  id: string,
  status: "accepted" | "rejected"
): Promise<TutorApplication> {
  const res = await fetch(`/api/tutor/applications/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    credentials: "include",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  })
  const data = await readJson<{ application?: TutorApplication }>(res)
  if (!data.application) throw new Error("The server did not return the updated application.")
  return data.application
}
