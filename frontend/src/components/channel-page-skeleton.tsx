import { VideoCardSkeleton } from "@/components/video-card-skeleton"

export function ChannelPageSkeleton() {
  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0 overflow-x-hidden">
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-6">
        {/* Header */}
        <section className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="h-6 w-64 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-28 rounded bg-gray-200 animate-pulse" />
          </div>
        </section>

        {/* Tabs header placeholder */}
        <div className="h-9 w-56 bg-gray-200 rounded animate-pulse mb-4" />

        {/* Videos grid skeleton */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <VideoCardSkeleton key={`channel-videos-skel-${i}`} />
          ))}
        </div>
      </main>
    </div>
  )
}
