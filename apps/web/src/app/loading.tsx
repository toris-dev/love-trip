import { Skeleton } from "@lovetrip/ui/components/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-black/10 dark:border-white/10 shadow-sm">
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[320px] w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
