const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"

interface ApiError {
  error?: string
}

/** Public browse query; the page builds the query string from its URL params. */
export const getAllTuitions = async (query = "") => {
  const suffix = query ? `?${query}` : ""
  const res = await fetch(`${BASE_URL}/tution-post${suffix}`, {
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
  const res = await fetch(`${BASE_URL}/tution-post/${encodeURIComponent(id)}`, {
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

export const gettution = async (query = "") => {
  const suffix = query ? `?${query}` : ""
  const res = await fetch(`${BASE_URL}/tution-post/my${suffix}`, {
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
