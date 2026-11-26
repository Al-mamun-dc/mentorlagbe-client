import { getAuthToken } from "@/lib/api/auth-token"
import { API_BASE_URL } from "@/lib/api/base-url"

interface ApiError {
  error?: string
}

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

async function readJson<T>(res: Response): Promise<T | null> {
  const text = await res.text()
  try {
    return text ? (JSON.parse(text) as T) : null
  } catch {
    return null
  }
}

export interface BookmarkedTuition {
  id: string
  title: string
  subject: string
  classLevel: string
  mode: "online" | "offline"
  location: string
  monthlyFee: number
  daysPerWeek: number
  description: string
  bannerImage: string
  tutorName: string
  tutorEmail: string
}

export interface BookmarkItem {
  id: string
  tuitionId: string
  createdAt: string | null
  tuition: BookmarkedTuition | null
}

export async function getBookmarkIds(): Promise<string[]> {
  const res = await fetchWithAuth(`${API_BASE_URL}/bookmarks/ids`, {
    credentials: "include",
    cache: "no-store",
  })
  const data = await readJson<{ tuitionIds?: unknown; error?: string }>(res)
  if (!res.ok) throw new Error(data?.error || `Failed to load bookmarks. (HTTP ${res.status})`)
  return Array.isArray(data?.tuitionIds) ? (data.tuitionIds as string[]) : []
}

export async function getMyBookmarks(): Promise<BookmarkItem[]> {
  const res = await fetchWithAuth(`${API_BASE_URL}/bookmarks/my`, {
    credentials: "include",
    cache: "no-store",
  })
  const data = await readJson<{ bookmarks?: BookmarkItem[]; error?: string }>(res)
  if (!res.ok) throw new Error(data?.error || `Failed to load bookmarks. (HTTP ${res.status})`)
  return Array.isArray(data?.bookmarks) ? data.bookmarks : []
}

export async function addBookmark(tuitionId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE_URL}/bookmarks/${encodeURIComponent(tuitionId)}`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  })
  if (res.ok) return
  const data = await readJson<ApiError>(res)
  throw new Error(data?.error || `Failed to bookmark tuition. (HTTP ${res.status})`)
}

export async function removeBookmark(tuitionId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE_URL}/bookmarks/${encodeURIComponent(tuitionId)}`, {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
  })
  if (res.ok) return
  const data = await readJson<ApiError>(res)
  throw new Error(data?.error || `Failed to remove bookmark. (HTTP ${res.status})`)
}
