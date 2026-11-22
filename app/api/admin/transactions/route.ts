import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin-auth"
import { getAdminTransactions } from "@/lib/admin-transactions"

export const runtime = "nodejs"

export async function GET() {
  try {
    const authResult = await requireAdmin()
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const data = await getAdminTransactions()
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("GET /api/admin/transactions failed:", message)

    return NextResponse.json(
      { error: "Failed to load transactions." },
      { status: 500 }
    )
  }
}
