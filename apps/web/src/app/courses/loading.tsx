import { Skeleton } from "@lovetrip/ui/components/skeleton"

export default function CoursesLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 min-h-[60vh]">
      <aside className="lg:w-80 space-y-4 shrink-0">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </aside>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
      <div className="hidden lg:block w-[400px] shrink-0">
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    </div>
  )
}
