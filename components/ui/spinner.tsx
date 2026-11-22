import { LoaderCircle } from "lucide-react"

import { cn } from "cn"

type SpinnerSize = "sm" | "md" | "lg"

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
}

interface SpinnerProps {
  className?: string
  size?: SpinnerSize
  label?: string
}

/** Lightweight spinner for small loading actions and inline states. */
export function Spinner({ className, size = "md", label = "Loading" }: SpinnerProps) {
  return (
    <LoaderCircle
      role="status"
      aria-label={label}
      className={cn("animate-spin text-brand-500", sizeClasses[size], className)}
    />
  )
}
