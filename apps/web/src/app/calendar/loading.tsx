import { Skeleton } from "@lovetrip/ui/components/skeleton"

export default function CalendarLoading() {
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
      <aside className="w-full lg:w-80 border-r p-4 space-y-4 shrink-0">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </aside>
      <main className="flex-1 p-4 overflow-auto">
        <Skeleton className="h-10 w-full max-w-md mb-4 rounded-lg" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </main>
    </div>
  )
}
