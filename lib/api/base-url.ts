const RAW_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"

export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "")

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}
