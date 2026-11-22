import { headers } from "next/headers"

import { auth } from "@/lib/auth"

export interface SessionUser {
  id: string
  role?: string | null
  email?: string | null
}

export type AuthGuardResult =
  | { ok: true; user: { id: string; email: string | null } }
  | { ok: false; status: 401 | 403; error: string }

export type AdminAuthResult = AuthGuardResult

/** Session lookup is shared by admin pages and protected API routes. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const authSession = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  })

  return authSession?.user ?? null
}

/** Admin identity and role always come from the verified Better Auth session. */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const user = await getSessionUser()

  if (!user) {
    return { ok: false, status: 401, error: "Please sign in to continue." }
  }

  if (user.role !== "admin") {
    return {
      ok: false,
      status: 403,
      error: "Only administrators can perform this action.",
    }
  }

  return { ok: true, user: { id: user.id, email: user.email ?? null } }
}

/** Tutor identity and role always come from the verified Better Auth session. */
export async function requireTutor(): Promise<AuthGuardResult> {
  const user = await getSessionUser()

  if (!user) {
    return { ok: false, status: 401, error: "Please sign in to continue." }
  }

  if (user.role !== "tutor") {
    return {
      ok: false,
      status: 403,
      error: "Only tutors can perform this action.",
    }
  }

  return { ok: true, user: { id: user.id, email: user.email ?? null } }
}
