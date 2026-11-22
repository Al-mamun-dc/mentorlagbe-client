import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { getProfile, updateProfile, validateProfileUpdate } from "@/lib/profile"

export const runtime = "nodejs"

/** The session is the only source of identity — never trust a client userId. */
async function getAuthenticatedUserId(): Promise<string | null> {
  const authSession = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  })
  return authSession?.user?.id ?? null
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to view your profile." },
        { status: 401 }
      )
    }

    const profile = await getProfile(userId)
    if (!profile) {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("GET /api/user/profile failed:", message)

    return NextResponse.json(
      { error: "Failed to load your profile." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to update your profile." },
        { status: 401 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    }

    const validated = validateProfileUpdate(body)
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 })
    }

    const profile = await updateProfile(userId, validated.value)
    if (!profile) {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("PATCH /api/user/profile failed:", message)

    return NextResponse.json(
      { error: "Failed to update your profile." },
      { status: 500 }
    )
  }
}
