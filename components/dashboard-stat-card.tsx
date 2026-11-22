import type { LucideIcon } from "lucide-react"

import { cn } from "cn"

interface DashboardStatCardProps {
  label: string
  value: string | number
  description: string
  icon: LucideIcon
  iconClassName?: string
  className?: string
}

export function DashboardStatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClassName,
  className,
}: DashboardStatCardProps) {
  return (
    <article className={cn("rounded-2xl border border-border bg-card p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-500",
            iconClassName
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
    </article>
  )
}
