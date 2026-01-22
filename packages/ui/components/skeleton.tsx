import { cn } from "@lovetrip/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      role="status"
      aria-label="로딩 중"
      className={cn(
        "bg-muted animate-pulse rounded-2xl",
        "relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
      {...props}
    >
      <span className="sr-only">로딩 중...</span>
    </div>
  )
}

export { Skeleton }
