import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { getUserPlanInfo } from "@/lib/subscription"

export const runtime = "nodejs"

export async function GET() {
  try {
    const authSession = await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    })

    if (!authSession?.user) {
      return NextResponse.json(
        { error: "Please sign in to view your plan." },
        { status: 401 }
      )
    }

    const planInfo = await getUserPlanInfo(authSession.user.id)
    if (!planInfo) {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    return NextResponse.json(planInfo)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("GET /api/user/plan failed:", message)

    return NextResponse.json(
      { error: "Failed to load your plan." },
      { status: 500 }
    )
  }
}
