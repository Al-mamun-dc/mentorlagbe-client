import { NextResponse } from "next/server"

import { requireTutor } from "@/lib/admin-auth"
import { listTutorApplications } from "@/lib/tutor-applications"

export const runtime = "nodejs"

export async function GET() {
  try {
    const authResult = await requireTutor()
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const applications = await listTutorApplications(authResult.user.id)
    return NextResponse.json({ applications })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("GET /api/tutor/applications failed:", message)
    return NextResponse.json({ error: "Failed to load applications." }, { status: 500 })
  }
}
