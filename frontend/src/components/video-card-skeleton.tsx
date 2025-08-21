export function VideoCardSkeleton() {
  return (
    <div className="group rounded-lg border border-gray-200 bg-white">
      {/* Thumbnail skeleton */}
      <div className="relative aspect-video rounded-t-lg overflow-hidden bg-gray-100">
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
        {/* Duration badge placeholder */}
        <div className="absolute bottom-2 right-2 rounded px-1.5 py-0.5 bg-gray-300/70">
          <div className="h-3 w-10 rounded bg-gray-200" />
        </div>
      </div>

      <div className="flex gap-3 p-3">
        {/* Avatar skeleton */}
        <div className="flex-shrink-0">
          <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
        </div>

        <div className="min-w-0 flex-1">
          {/* Title skeleton - two lines with varying widths */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-3/5 rounded bg-gray-200 animate-pulse" />
          </div>

          {/* Channel name */}
          <div className="mt-2 h-3 w-2/5 rounded bg-gray-200 animate-pulse" />

          {/* Views and date */}
          <div className="mt-1 h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
