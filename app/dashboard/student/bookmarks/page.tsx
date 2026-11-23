"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  BookOpen,
  BookmarkX,
  CalendarDays,
  GraduationCap,
  Inbox,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import {
  getMyBookmarks,
  removeBookmark,
  type BookmarkItem,
} from "@/lib/api/bookmarks"
import { clearBookmarkIdsCache } from "@/components/bookmark-button"

function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export default function StudentBookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [removingId, setRemovingId] = useState<string | null>(null)

  const loadBookmarks = useCallback(async () => {
    setError("")
    try {
      const data = await getMyBookmarks()
      setBookmarks(data)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load bookmarks. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await getMyBookmarks()
        if (active) setBookmarks(data)
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load bookmarks. Please try again."
          )
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  async function handleRemove(tuitionId: string) {
    if (removingId) return
    setRemovingId(tuitionId)
    try {
      await removeBookmark(tuitionId)
      clearBookmarkIdsCache()
      setBookmarks((current) => current.filter((b) => b.tuitionId !== tuitionId))
      toast.add({ title: "Bookmark removed", description: "Tuition removed from your bookmarks." })
    } catch (removeError) {
      toast.add({
        title: "Error",
        description:
          removeError instanceof Error ? removeError.message : "Failed to remove bookmark.",
      })
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl" aria-busy={isLoading}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            Student dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Bookmarks
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Saved tuitions you want to review later.
          </p>
        </div>
        <Button render={<Link href="/tuitions" />} nativeButton={false} variant="outline" className="h-10">
          <BookOpen aria-hidden />
          Browse tuitions
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2" aria-label="Loading bookmarks">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-2xl border border-border bg-card p-5">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((__, itemIndex) => (
                  <div key={itemIndex}>
                    <div className="h-3 w-20 rounded bg-muted" />
                    <div className="mt-2 h-4 w-32 rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-3xl border border-rose-500/30 bg-rose-500/5 px-6 py-16 text-center">
          <AlertCircle className="mx-auto size-7 text-rose-500" aria-hidden />
          <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{error}</p>
          <Button type="button" variant="outline" className="mt-6" onClick={() => void loadBookmarks()}>
            <RefreshCw aria-hidden />
            Retry
          </Button>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
            <Inbox className="size-7" aria-hidden />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-foreground">No bookmarks yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Save tuitions you are interested in and they will appear here.
          </p>
          <Button render={<Link href="/tuitions" />} nativeButton={false} className="mt-6 h-10 bg-brand-500 px-4 text-white hover:bg-brand-400">
            <BookOpen aria-hidden />
            Browse tuitions
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {bookmarks.map((bookmark) => {
            const tuition = bookmark.tuition
            const removing = removingId === bookmark.tuitionId
            return (
              <article
                key={bookmark.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-foreground" title={tuition?.title || "Tuition unavailable"}>
                      {tuition?.title || "Tuition unavailable"}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Saved on {formatDate(bookmark.createdAt)}
                    </p>
                  </div>
                </div>

                {tuition ? (
                  <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><GraduationCap className="size-3.5" aria-hidden />Class level</dt>
                      <dd className="mt-1 truncate text-sm font-medium text-foreground">{tuition.classLevel || "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5" aria-hidden />Location</dt>
                      <dd className="mt-1 truncate text-sm font-medium text-foreground">{tuition.location || "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Wallet className="size-3.5" aria-hidden />Monthly fee</dt>
                      <dd className="mt-1 truncate text-sm font-medium text-foreground">৳{tuition.monthlyFee.toLocaleString("en-US")}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-3.5" aria-hidden />Days per week</dt>
                      <dd className="mt-1 truncate text-sm font-medium text-foreground">{tuition.daysPerWeek} {tuition.daysPerWeek === 1 ? "day" : "days"}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-5 text-sm text-muted-foreground">This tuition is no longer available.</p>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
                  {tuition && (
                    <Button render={<Link href={`/tuitions/${tuition.id}`} />} nativeButton={false} variant="outline" size="sm">
                      <BookOpen aria-hidden />
                      View details
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={removing}
                    onClick={() => void handleRemove(bookmark.tuitionId)}
                  >
                    {removing ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <BookmarkX aria-hidden />}
                    {removing ? "Removing…" : "Remove bookmark"}
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
