"use client"

import { useEffect, useState } from "react"
import { Bookmark, LoaderCircle } from "lucide-react"

import { useSession } from "@/lib/auth-client"
import { addBookmark, getBookmarkIds, removeBookmark } from "@/lib/api/bookmarks"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

type BookmarkState = "unknown" | "saved" | "unsaved"

let cachedIds: Set<string> | null = null
let inflightIds: Promise<Set<string>> | null = null
const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) listener()
}

async function loadIds(force = false): Promise<Set<string>> {
  if (!force && cachedIds) return cachedIds
  if (!force && inflightIds) return inflightIds
  inflightIds = getBookmarkIds()
    .then((ids) => {
      cachedIds = new Set(ids)
      notify()
      return cachedIds
    })
    .finally(() => {
      inflightIds = null
    })
  return inflightIds
}

export function primeBookmarkIds(ids: string[]) {
  cachedIds = new Set(ids)
  notify()
}

export function clearBookmarkIdsCache() {
  cachedIds = null
  notify()
}

interface BookmarkButtonProps {
  tuitionId: string
  className?: string
  iconOnly?: boolean
  onDark?: boolean
}

export function BookmarkButton({
  tuitionId,
  className,
  iconOnly = false,
  onDark = false,
}: BookmarkButtonProps) {
  const { data: session, isPending } = useSession()
  const isStudent = session?.user?.role === "student"
  const [state, setState] = useState<BookmarkState>(() => {
    if (!cachedIds) return "unknown"
    return cachedIds.has(tuitionId) ? "saved" : "unsaved"
  })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isStudent) return

    const sync = () => {
      if (!cachedIds) return
      setState(cachedIds.has(tuitionId) ? "saved" : "unsaved")
    }

    listeners.add(sync)
    if (!cachedIds) {
      void loadIds().catch(() => {
        setState("unsaved")
      })
    }

    return () => {
      listeners.delete(sync)
    }
  }, [isStudent, tuitionId])

  if (isPending) return null
  if (!session?.user) return null
  if (!isStudent) return null

  const effectiveState = state
  const saved = effectiveState === "saved"

  async function toggle() {
    if (busy || state === "unknown") return
    setBusy(true)
    try {
      if (saved) {
        await removeBookmark(tuitionId)
        cachedIds = new Set([...(cachedIds ?? []), tuitionId].filter((id) => id !== tuitionId))
        cachedIds.delete(tuitionId)
        setState("unsaved")
        notify()
        toast.add({ title: "Bookmark removed", description: "Tuition removed from your bookmarks." })
      } else {
        await addBookmark(tuitionId)
        cachedIds = new Set([...(cachedIds ?? []), tuitionId])
        setState("saved")
        notify()
        toast.add({ title: "Bookmarked", description: "Tuition saved to your bookmarks." })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update bookmark."
      toast.add({ title: "Bookmark failed", description: message })
      void loadIds(true).catch(() => {})
    } finally {
      setBusy(false)
    }
  }

  const label = saved ? "Remove bookmark" : "Bookmark tuition"

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={saved}
      title={label}
      disabled={busy || state === "unknown"}
      onClick={() => void toggle()}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none disabled:opacity-60",
        iconOnly ? "size-10 shrink-0" : "h-10 px-4",
        onDark
          ? saved
            ? "border-brand-500/40 bg-brand-500/15 text-brand-300 hover:bg-brand-500/25"
            : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
          : saved
            ? "border-brand-500/40 bg-brand-500/10 text-brand-600 hover:bg-brand-500/15 dark:text-brand-300"
            : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {busy ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden />
      ) : (
        <Bookmark className={cn("size-4", saved && "fill-current")} aria-hidden />
      )}
      {!iconOnly && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  )
}
