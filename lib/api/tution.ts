const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"

interface ApiError {
  error?: string
}

export const gettution = async () => {
  const res = await fetch(`${BASE_URL}/tution-post/my`, {
    credentials: "include",
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
