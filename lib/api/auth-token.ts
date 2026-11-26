import { authClient } from "@/lib/auth-client"

type TokenResult = { token: string } | null

let cachedToken: { value: string; expiresAt: number } | null = null
let inflight: Promise<TokenResult> | null = null

function readJwtExp(token: string): number | null {
  try {
    const parts = token.split(".")
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")
    const payload = JSON.parse(atob(padded)) as { exp?: unknown }
    return typeof payload.exp === "number" ? payload.exp : null
  } catch {
    return null
  }
}

async function requestToken(): Promise<TokenResult> {
  try {
    // Prefer the Better Auth JWT client method when available; fallback to the plugin endpoint.
    const client = authClient as typeof authClient & {
      token?: () => Promise<{ data?: { token?: string } | null; error?: unknown }>
    }

    const response = client.token
      ? await client.token()
      : await authClient.$fetch<{ token: string }>("/token", { method: "GET" })

    const token = response?.data?.token
    if (response?.error || typeof token !== "string" || !token) {
      if (response?.error) {
        console.warn("Better Auth JWT token retrieval failed:", response.error)
      }
      return null
    }

    const exp = readJwtExp(token)
    cachedToken = {
      value: token,
      expiresAt: exp ? (exp - 30) * 1000 : Date.now() + 60_000,
    }
    return { token }
  } catch (error) {
    console.warn("Better Auth JWT token retrieval threw:", error)
    return null
  }
}

/** Returns a Better Auth JWT for Authorization: Bearer requests. In-memory only. */
export async function getAuthToken(forceRefresh = false): Promise<string | null> {
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value
  }
  if (!forceRefresh && inflight) {
    const result = await inflight
    return result?.token ?? null
  }

  cachedToken = null
  inflight = requestToken().finally(() => {
    inflight = null
  })
  const result = await inflight
  return result?.token ?? null
}

export function clearAuthTokenCache() {
  cachedToken = null
}
