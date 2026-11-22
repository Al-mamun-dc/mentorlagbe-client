import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { getProfile } from "@/lib/profile"

import ProfileForm from "./profile-form"

export const runtime = "nodejs"

export default async function ProfilePage() {
  const authSession = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  })

  if (!authSession?.user) {
    redirect("/sign-in")
  }

  const profile = await getProfile(authSession.user.id)

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Update Profile
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Keep your personal details and profile picture up to date.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-charcoal p-6 shadow-2xl shadow-black/30 sm:p-8">
        {profile ? (
          <ProfileForm initialProfile={profile} />
        ) : (
          <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            We could not find your account. Please sign in again.
          </p>
        )}
      </div>
    </section>
  )
}
