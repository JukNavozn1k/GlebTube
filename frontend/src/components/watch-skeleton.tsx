export function WatchPageSkeleton() {
  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0 overflow-x-hidden">
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6 grid gap-6 lg:grid-cols-[1fr_360px] items-start">
        {/* Left: player and meta */}
        <section className="grid gap-4 min-w-0">
          {/* Player area */}
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
            <div className="absolute inset-0 animate-pulse bg-gray-200" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="h-5 sm:h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Channel row */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-8 w-28 rounded bg-gray-200 animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Comments toggle area for mobile (placeholder) */}
          <div className="lg:hidden">
            <div className="h-9 w-40 bg-gray-200 rounded animate-pulse" />
          </div>
        </section>

        {/* Right: recommended list */}
        <aside className="grid gap-4 self-start min-w-0">
          <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`rec-skel-${i}`} className="flex gap-3 min-w-0">
                <div className="relative aspect-video w-40 min-w-40 rounded-md overflow-hidden bg-gray-100">
                  <div className="absolute inset-0 animate-pulse bg-gray-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  )
}
