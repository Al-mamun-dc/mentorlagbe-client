import { redirect } from "next/navigation"

import { getSessionUser } from "@/lib/admin-auth"

import AdminTransactions from "./admin-transactions"

export const runtime = "nodejs"

export default async function AdminTransactionsPage() {
  const user = await getSessionUser()

  if (!user) {
    redirect("/sign-in")
  }

  if (user.role !== "admin") {
    redirect("/")
  }

  return <AdminTransactions />
}
