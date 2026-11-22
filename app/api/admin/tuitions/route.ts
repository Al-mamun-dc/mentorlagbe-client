import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin-auth"
import { listAdminTuitions } from "@/lib/admin-tuition"

export const runtime = "nodejs"

export async function GET() {
  try {
    const authResult = await requireAdmin()
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const tuitions = await listAdminTuitions()
    return NextResponse.json({ tuitions })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("GET /api/admin/tuitions failed:", message)

    return NextResponse.json(
      { error: "Failed to load tuition approvals." },
      { status: 500 }
    )
  }
}
