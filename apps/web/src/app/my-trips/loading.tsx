import { Skeleton } from "@lovetrip/ui/components/skeleton"

export default function MyTripsLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl space-y-6">
      <Skeleton className="h-9 w-40 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
