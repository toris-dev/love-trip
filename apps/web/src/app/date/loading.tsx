import { Skeleton } from "@lovetrip/ui/components/skeleton"

export default function DateLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 min-h-[60vh]">
      <aside className="lg:w-80 space-y-4 shrink-0">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </aside>
      <div className="flex-1 space-y-4">
        <Skeleton className="h-12 w-48 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="hidden lg:block w-[400px] shrink-0">
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    </div>
  )
}
