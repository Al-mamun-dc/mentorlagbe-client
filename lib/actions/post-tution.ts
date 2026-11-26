import { getAuthToken } from "@/lib/api/auth-token"
import { API_BASE_URL } from "@/lib/api/base-url"

interface TuitionFormState {
  title: string;
  subject: string;
  classLevel: string;
  mode: "online" | "offline";
  location: string;
  monthlyFee: string;
  daysPerWeek: string;
  description: string;
  bannerImage?: string;
}

interface PostTuitionError {
  error?: string;
}

// Uses centralized Express backend base URL.

async function authHeaders(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {}
  const token = await getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function fetchWithAuth(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  const tokenHeaders = await authHeaders()
  for (const [key, value] of Object.entries(tokenHeaders)) {
    if (!headers.has(key)) headers.set(key, value)
  }
  const response = await fetch(input, { ...init, headers })
  if (response.status === 401 && typeof window !== "undefined") {
    await getAuthToken(true)
    const retryHeaders = new Headers(init.headers)
    const fresh = await authHeaders()
    for (const [key, value] of Object.entries(fresh)) retryHeaders.set(key, value)
    return fetch(input, { ...init, headers: retryHeaders })
  }
  return response
}

export const posttution = async (data: TuitionFormState) => {
  const res = await fetchWithAuth(`${API_BASE_URL}/tution-post`, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = (await res.json().catch(() => ({}))) as PostTuitionError

  if (!res.ok) {
    throw new Error(result.error || "Failed to post tuition. Please try again.")
  }

  return result
}
export const deleteTution = async (id: string) => {
  const res = await fetchWithAuth(`${API_BASE_URL}/tution-post/${id}`, {
    method: "DELETE",
    credentials: "include",
  })

  const text = await res.text()
  let result: PostTuitionError = {}

  try {
    result = text ? JSON.parse(text) : {}
  } catch {
    result = {}
  }

  if (!res.ok) {
    throw new Error(result.error || `Failed to delete tuition. (HTTP ${res.status})`)
  }

  return result
}



export const updateTution = async (
  id: string,
  data: TuitionFormState
) => {
  const res = await fetchWithAuth(`${API_BASE_URL}/tution-post/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = (await res.json().catch(() => ({}))) as PostTuitionError

  if (!res.ok) {
    throw new Error(result.error || "Failed to update tuition.")
  }

  return result
}
