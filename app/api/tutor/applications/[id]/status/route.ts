import { NextResponse } from "next/server"

import { requireTutor } from "@/lib/admin-auth"
import { isValidObjectId } from "@/lib/object-id"
import {
  parseTutorApplicationStatus,
  TutorApplicationError,
  updateTutorApplicationStatus,
} from "@/lib/tutor-applications"

export const runtime = "nodejs"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const authResult = await requireTutor()
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { id } = await params
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid application ID." }, { status: 400 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    }

    const status = parseTutorApplicationStatus(
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as { status?: unknown }).status
        : null
    )

    if (!status) {
      return NextResponse.json(
        { error: "Status must be accepted or rejected." },
        { status: 400 }
      )
    }

    const application = await updateTutorApplicationStatus({
      applicationId: id,
      tutorId: authResult.user.id,
      status,
    })

    return NextResponse.json({ application })
  } catch (error) {
    if (error instanceof TutorApplicationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("PATCH /api/tutor/applications/[id]/status failed:", message)
    return NextResponse.json({ error: "Failed to update application status." }, { status: 500 })
  }
}
