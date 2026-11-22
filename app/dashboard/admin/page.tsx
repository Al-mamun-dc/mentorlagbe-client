import { redirect } from "next/navigation"

import { getSessionUser } from "@/lib/admin-auth"

import AdminOverview from "./admin-overview"

export const runtime = "nodejs"

export default async function AdminDashboardPage() {
  const user = await getSessionUser()

  if (!user) {
    redirect("/sign-in")
  }

  if (user.role !== "admin") {
    redirect("/")
  }

  return <AdminOverview />
}
