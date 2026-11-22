import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin-auth"
import { AdminUserError, parseAdminRole, updateUserRole } from "@/lib/admin-users"
import { isValidObjectId } from "@/lib/object-id"

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
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID." }, { status: 400 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    }

    const role = parseAdminRole(
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as { role?: unknown }).role
        : null
    )

    if (!role) {
      return NextResponse.json(
        { error: "Role must be student, tutor, or admin." },
        { status: 400 }
      )
    }

    const user = await updateUserRole({
      targetUserId: id,
      nextRole: role,
      actingAdminId: authResult.user.id,
    })

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof AdminUserError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("PATCH /api/admin/users/[id]/role failed:", message)

    return NextResponse.json(
      { error: "Failed to update user role." },
      { status: 500 }
    )
  }
}
