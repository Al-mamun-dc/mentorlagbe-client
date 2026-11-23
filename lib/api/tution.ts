import { getAuthToken } from "@/lib/api/auth-token"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"

interface ApiError {
  error?: string
}

async function authHeaders(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {}
  const token = await getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function fetchWithAuth(
  input: string,
  init: RequestInit = {},
  canRetry = true
): Promise<Response> {
  const headers = new Headers(init.headers)
  const tokenHeaders = await authHeaders()
  for (const [key, value] of Object.entries(tokenHeaders)) {
    if (!headers.has(key)) headers.set(key, value)
  }

  const response = await fetch(input, { ...init, headers })
  if (response.status !== 401 || !canRetry || typeof window === "undefined") {
    return response
  }

  // Retry once with a fresh JWT; cookie fallback remains via credentials: "include".
  await getAuthToken(true)
  const retryHeaders = new Headers(init.headers)
  const fresh = await authHeaders()
  for (const [key, value] of Object.entries(fresh)) {
    retryHeaders.set(key, value)
  }
  return fetch(input, { ...init, headers: retryHeaders })
}

/** Public browse query; the page builds the query string from its URL params. */
export const getAllTuitions = async (query = "") => {
  const suffix = query ? `?${query}` : ""
  const res = await fetchWithAuth(`${BASE_URL}/tution-post${suffix}`, {
    cache: "no-store",
  })

  const text = await res.text()
  let result: unknown = []

  try {
    result = text ? JSON.parse(text) : []
  } catch {
    result = []
  }

  if (!res.ok) {
    const error = (result as ApiError | null)?.error
    throw new Error(error || `Failed to load tuitions. (HTTP ${res.status})`)
  }

  return result
}

export interface TuitionTutorSummary {
  name: string
  image: string
  role: string
  joinedAt?: string | null
}

export interface TuitionDetails {
  id: string
  title: string
  subject: string
  classLevel: string
  mode: "online" | "offline"
  location: string
  monthlyFee: number
  daysPerWeek: number
  schedule: string
  description: string
  bannerImage: string
  createdAt?: string | null
  tutor: TuitionTutorSummary
}

/** Public single-tuition fetch. Returns null for invalid, missing, or unavailable posts. */
export const getTuitionById = async (id: string): Promise<TuitionDetails | null> => {
  const res = await fetchWithAuth(`${BASE_URL}/tution-post/${encodeURIComponent(id)}`, {
    cache: "no-store",
  })

  const text = await res.text()
  let result: unknown = null

  try {
    result = text ? JSON.parse(text) : null
  } catch {
    result = null
  }

  if (res.status === 400 || res.status === 404) return null

  if (!res.ok) {
    const error = (result as ApiError | null)?.error
    throw new Error(error || `Failed to load tuition details. (HTTP ${res.status})`)
  }

  return (result as TuitionDetails | null) ?? null
}

export interface TuitionApplicationPayload {
  phone: string
  preferredSchedule: string
  learningNote?: string
}

export interface TuitionApplicationResult {
  id: string
  tuitionId: string
  tuitionTitle: string
  studentId: string
  studentName: string
  studentEmail: string
  phone: string
  preferredSchedule: string
  learningNote: string
  status: "pending"
  createdAt: string
}

/** Authenticated student application. Identity is resolved by the backend session. */
export const applyToTuition = async (
  tuitionId: string,
  payload: TuitionApplicationPayload
): Promise<TuitionApplicationResult> => {
  const res = await fetchWithAuth(`${BASE_URL}/tution-post/${encodeURIComponent(tuitionId)}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(payload),
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
    throw new Error(error || `Failed to submit application. (HTTP ${res.status})`)
  }

  return result as TuitionApplicationResult
}

export type ApplicationStatus = "pending" | "accepted" | "rejected"

/** A student's application joined with the current tuition post. */
export interface StudentApplication {
  id: string
  tuitionId: string
  tuitionTitle: string
  tutorName: string
  tutorEmail: string
  monthlyFee: number
  appliedDate: string | null
  createdAt: string | null
  status: ApplicationStatus
  phone: string
  preferredSchedule: string
  learningNote: string
}

export interface MyApplicationsResponse {
  totalApplications: number
  applications: StudentApplication[]
}

/** Returns only the authenticated student's applications. */
export const getMyApplications = async (): Promise<MyApplicationsResponse> => {
  const res = await fetchWithAuth(`${BASE_URL}/application/my`, {
    credentials: "include",
    cache: "no-store",
  })

  const text = await res.text()
  let result: unknown = { totalApplications: 0, applications: [] }

  try {
    result = text ? JSON.parse(text) : { totalApplications: 0, applications: [] }
  } catch {
    result = { totalApplications: 0, applications: [] }
  }

  if (!res.ok) {
    const error = (result as ApiError | null)?.error
    throw new Error(error || `Failed to load applications. (HTTP ${res.status})`)
  }

  const data = result as Partial<MyApplicationsResponse>

  return {
    totalApplications: Number(data.totalApplications) || 0,
    applications: Array.isArray(data.applications) ? data.applications : [],
  }
}

/** Cancels an application only if it belongs to the student and is still pending. */
export const deleteApplication = async (applicationId: string): Promise<void> => {
  const res = await fetchWithAuth(
    `${BASE_URL}/application/${encodeURIComponent(applicationId)}`,
    {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    }
  )

  if (res.ok) return

  const text = await res.text()
  let result: unknown = null

  try {
    result = text ? JSON.parse(text) : null
  } catch {
    result = null
  }

  const error = (result as ApiError | null)?.error
  throw new Error(error || `Failed to cancel application. (HTTP ${res.status})`)
}

export const gettution = async (query = "") => {
  const suffix = query ? `?${query}` : ""
  const res = await fetchWithAuth(`${BASE_URL}/tution-post/my${suffix}`, {
    credentials: "include",
    cache: "no-store",
  })

  const text = await res.text()
  let result: unknown = []

  try {
    result = text ? JSON.parse(text) : []
  } catch {
    result = []
  }

  if (!res.ok) {
    const error = (result as ApiError | null)?.error
    throw new Error(error || `Failed to load tuitions. (HTTP ${res.status})`)
  }

  return result
}
