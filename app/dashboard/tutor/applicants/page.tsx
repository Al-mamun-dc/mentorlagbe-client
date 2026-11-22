import { redirect } from "next/navigation"

import { getSessionUser } from "@/lib/admin-auth"

import TutorApplicants from "./tutor-applicants"

export const runtime = "nodejs"

export default async function TutorApplicantsPage() {
  const user = await getSessionUser()

  if (!user) {
    redirect("/sign-in")
  }

  if (user.role !== "tutor") {
    redirect("/")
  }

  return <TutorApplicants />
}
