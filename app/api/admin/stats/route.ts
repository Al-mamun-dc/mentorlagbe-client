import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin-auth"
import { getAdminStats } from "@/lib/admin-stats"

export const runtime = "nodejs"

export async function GET() {
  try {
    const authResult = await requireAdmin()
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const stats = await getAdminStats()
    return NextResponse.json(stats)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("GET /api/admin/stats failed:", message)

    return NextResponse.json(
      { error: "Failed to load admin statistics." },
      { status: 500 }
    )
  }
}
