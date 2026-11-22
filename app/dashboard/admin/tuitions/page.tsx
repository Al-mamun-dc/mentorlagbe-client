import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

import AdminTuitions from "./admin-tuitions"

export const runtime = "nodejs"

export default async function AdminTuitionsPage() {
  const authSession = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  })

  if (!authSession?.user) {
    redirect("/sign-in")
  }

  if (authSession.user.role !== "admin") {
    redirect("/")
  }

  return <AdminTuitions />
}
