import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin-auth"
import {
  isValidTuitionId,
  parseApprovalStatus,
  updateTuitionApproval,
} from "@/lib/admin-tuition"

export const runtime = "nodejs"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { id } = await params
    if (!isValidTuitionId(id)) {
      return NextResponse.json({ error: "Invalid tuition ID." }, { status: 400 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    }

    const approvalStatus = parseApprovalStatus(
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as { approvalStatus?: unknown }).approvalStatus
        : null
    )

    if (!approvalStatus) {
      return NextResponse.json(
        { error: "approvalStatus must be either approved or rejected." },
        { status: 400 }
      )
    }

    const tuition = await updateTuitionApproval(id, approvalStatus)
    if (!tuition) {
      return NextResponse.json({ error: "Tuition not found." }, { status: 404 })
    }

    return NextResponse.json({ tuition })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("PATCH /api/admin/tuitions/[id]/approval failed:", message)

    return NextResponse.json(
      { error: "Failed to update tuition approval." },
      { status: 500 }
    )
  }
}
