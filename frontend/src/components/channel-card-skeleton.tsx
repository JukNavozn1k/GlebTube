export function ChannelCardSkeleton() {
  return (
    <div className="rounded-lg border border-blue-100 p-4">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="flex items-center gap-4 text-xs mb-2">
            <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse mb-1" />
          <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-8 w-28 rounded bg-gray-200 animate-pulse flex-shrink-0" />
      </div>
    </div>
  )
}
