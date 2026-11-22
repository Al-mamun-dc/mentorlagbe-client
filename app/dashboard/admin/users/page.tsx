import { redirect } from "next/navigation"

import { getSessionUser } from "@/lib/admin-auth"

import AdminUsers from "./admin-users"

export const runtime = "nodejs"

export default async function AdminUsersPage() {
  const user = await getSessionUser()

  if (!user) {
    redirect("/sign-in")
  }

  if (user.role !== "admin") {
    redirect("/")
  }

  return <AdminUsers />
}
