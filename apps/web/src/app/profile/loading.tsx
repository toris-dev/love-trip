import { Skeleton } from "@lovetrip/ui/components/skeleton"

export default function ProfileLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex flex-col md:flex-row gap-6 rounded-3xl border-2 p-6 sm:p-8">
        <Skeleton className="h-24 w-24 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-4 w-48 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-lg" />
        </div>
      </div>
      <div className="rounded-3xl border-2 p-6 sm:p-8 space-y-4">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="rounded-3xl border-2 p-6 sm:p-8 space-y-4">
        <Skeleton className="h-6 w-32 rounded-lg" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
