import { cn } from "@/lib/utils"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { useSearchParams, useLocation } from "react-router-dom" // заменили на react-router-dom
import { VideoCard } from "@/components/video-card"
import { VideoCardSkeleton } from "@/components/video-card-skeleton"
import { BottomNav } from "@/components/bottom-nav"
import { videoUseCases } from "@/use-cases/video"
import type { Video } from "@/types/video"
import { usePaginatedList } from "@/hooks/use-paginated-list"

export function HomePage() {
  const [searchParams] = useSearchParams() // в react-router-dom возвращается массив [params, setParams]
  const q = (searchParams.get("q") || "").toLowerCase().trim()
  const loadFirst = useCallback(() => (q ? videoUseCases.search(q) : videoUseCases.fetchListPaginated()), [q])
  const loadNext = useCallback((next: string) => videoUseCases.fetchNext(next), [])
  const { items: apiVideos, loading: isLoading, reload } = usePaginatedList<Video>(loadFirst, loadNext)

  const location = useLocation()

  // Avoid double initial load: hook already loads on mount. Only reload when q/path change after mount.
  const didMountRef = useRef(false)
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    if (location.pathname === "/" || location.pathname === "") reload()
  }, [location.pathname, q, reload])

  const allVideos = useMemo<Video[]>(() => apiVideos, [apiVideos])

  // Server already filtered when q present. Ensure it's always an array.
  const filtered = useMemo<Video[]>(() => (Array.isArray(allVideos) ? allVideos : []), [allVideos])

  // Debug: log what's being rendered
  console.log("HomePage: filtered videos count=", filtered.length)
  if (filtered.length) console.log("HomePage: sample video=", filtered[0])

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-6xl px-3 sm:px-4">
        {q && (
          <div className="py-2 text-sm">
            Результаты по запросу: <span className="font-medium text-blue-700">{q}</span>
            <span className="text-muted-foreground ml-2">({filtered.length} видео)</span>
          </div>
        )}
        <div className={cn("grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", q ? "pt-0" : "pt-2")}>
          {isLoading ? (
            // Show skeleton cards while loading
            Array.from({ length: 6 }).map((_, index) => (
              <VideoCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : (
            // Show actual video cards when loaded
            (Array.isArray(filtered) ? filtered : []).map((v: Video) => (
              <VideoCard key={v.id} video={v} />
            ))
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
