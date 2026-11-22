import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin-auth"
import { listAdminUsers } from "@/lib/admin-users"

export const runtime = "nodejs"

export async function GET() {
  try {
    const authResult = await requireAdmin()
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const users = await listAdminUsers()
    return NextResponse.json({ users })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("GET /api/admin/users failed:", message)

    return NextResponse.json(
      { error: "Failed to load users." },
      { status: 500 }
    )
  }
}
