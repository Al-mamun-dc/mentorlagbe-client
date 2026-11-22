"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  LoaderCircle,
  RefreshCw,
  Search,
  Shield,
  UserCog,
  Users,
} from "lucide-react"

import {
  getAdminUsers,
  updateAdminUserRole,
  type AdminRole,
  type AdminUser,
} from "@/lib/api/admin"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"

const TOAST_IDS = {
  roleSuccess: "admin-user-role-success",
  roleError: "admin-user-role-error",
} as const

const ROLE_OPTIONS: { value: AdminRole; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "tutor", label: "Tutor" },
  { value: "admin", label: "Admin" },
]

function formatDate(value: string | null): string {
  if (!value) return "Not available"
  const parsed = new Date(value)
  if (!Number.isFinite(parsed.getTime())) return value
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed)
}

function RoleBadge({ role }: { role: AdminRole | null }) {
  const label = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Unknown"
  const className =
    role === "admin"
      ? "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300"
      : role === "tutor"
        ? "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300"
        : role === "student"
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-border bg-muted text-muted-foreground"

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

function PlanBadge({ plan }: { plan: "free" | "pro" }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        plan === "pro"
          ? "border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-300"
          : "border-border bg-muted text-muted-foreground"
      }`}
    >
      {plan === "pro" ? "Pro" : "Free"}
    </span>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: typeof Users
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-500">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-2xl font-bold leading-none text-foreground">{value}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)_120px_100px_150px_170px]"
        >
          {Array.from({ length: 6 }).map((__, cell) => (
            <div key={cell} className="h-5 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function AdminUsers() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | AdminRole>("all")
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const currentUserId = session?.user?.id

  useEffect(() => {
    let isMounted = true

    async function loadUsers() {
      setIsLoading(true)
      setError("")

      try {
        const result = await getAdminUsers()
        if (isMounted) setUsers(result)
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load users.")
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadUsers()
    return () => {
      isMounted = false
    }
  }, [reloadToken])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return users.filter((user) => {
      const matchesRole = roleFilter === "all" ? true : user.role === roleFilter
      const matchesQuery =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)

      return matchesRole && matchesQuery
    })
  }, [roleFilter, search, users])

  const counts = useMemo(
    () => ({
      total: users.length,
      students: users.filter((user) => user.role === "student").length,
      tutors: users.filter((user) => user.role === "tutor").length,
      admins: users.filter((user) => user.role === "admin").length,
    }),
    [users]
  )

  async function handleRoleChange(user: AdminUser, nextRole: AdminRole) {
    if (savingUserId) return
    if (user.role === nextRole) return

    const confirmed = window.confirm(
      `Change ${user.name || user.email}'s role from ${user.role ?? "unknown"} to ${nextRole}?`
    )
    if (!confirmed) return

    setSavingUserId(user.id)
    try {
      const updated = await updateAdminUserRole(user.id, nextRole)
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)))

      toast.close(TOAST_IDS.roleError)
      toast.add({
        id: TOAST_IDS.roleSuccess,
        type: "success",
        title: "Role updated",
        description: `${updated.name || updated.email} is now ${updated.role}.`,
      })
    } catch (err) {
      toast.close(TOAST_IDS.roleSuccess)
      toast.add({
        id: TOAST_IDS.roleError,
        type: "error",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update user role.",
      })
    } finally {
      setSavingUserId(null)
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            Admin dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            User Management
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            View registered users and manage roles securely. Sensitive account fields are never exposed.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setReloadToken((token) => token + 1)}
          disabled={isLoading}
        >
          <RefreshCw className={isLoading ? "animate-spin" : ""} aria-hidden />
          Refresh
        </Button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={counts.total} icon={Users} />
        <StatCard label="Students" value={counts.students} icon={UserCog} />
        <StatCard label="Tutors" value={counts.tutors} icon={UserCog} />
        <StatCard label="Admins" value={counts.admins} icon={Shield} />
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
            className="h-10 pl-9"
            aria-label="Search users by name or email"
          />
        </div>

        <label className="block">
          <span className="sr-only">Filter by role</span>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as "all" | AdminRole)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/25"
          >
            <option value="all">All roles</option>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>

      {isLoading ? (
        <LoadingRows />
      ) : error ? (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 px-6 py-16 text-center">
          <AlertCircle className="mx-auto size-7 text-rose-500" aria-hidden />
          <p role="alert" className="mt-4 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-5"
            onClick={() => setReloadToken((token) => token + 1)}
          >
            <RefreshCw aria-hidden />
            Retry
          </Button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <Users className="mx-auto size-7 text-muted-foreground" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold text-foreground">No users found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different search or role filter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="hidden md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)_120px_100px_150px_170px] md:gap-3 md:border-b md:border-border md:bg-muted/30 md:px-4 md:py-3 md:text-xs md:font-semibold md:uppercase md:tracking-wide md:text-muted-foreground">
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Plan</div>
            <div>Registration Date</div>
            <div>Manage Role</div>
          </div>

          <div className="divide-y divide-border">
            {filteredUsers.map((user) => {
              const isSelf = currentUserId === user.id
              const isSaving = savingUserId === user.id

              return (
                <article
                  key={user.id}
                  className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)_120px_100px_150px_170px] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground" title={user.name}>
                      {user.name || "Unnamed user"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground md:hidden">{user.email}</p>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm text-muted-foreground" title={user.email}>
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <RoleBadge role={user.role} />
                  </div>

                  <div>
                    <PlanBadge plan={user.plan} />
                  </div>

                  <div className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</div>

                  <div>
                    <label className="block">
                      <span className="sr-only">Change role for {user.name || user.email}</span>
                      <div className="relative">
                        <select
                          value={user.role ?? "student"}
                          disabled={isSaving}
                          onChange={(event) =>
                            void handleRoleChange(user, event.target.value as AdminRole)
                          }
                          className="h-9 w-full rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {ROLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {isSaving ? (
                          <LoaderCircle
                            className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                            aria-hidden
                          />
                        ) : null}
                      </div>
                    </label>
                    {isSelf ? (
                      <p className="mt-1 text-[11px] text-muted-foreground">Your account</p>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
