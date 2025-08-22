import { type Video } from "@/types/video"
import { VideoCard } from "@/components/video-card"
import { VideoCardSkeleton } from "@/components/video-card-skeleton"
import { BottomNav } from "@/components/bottom-nav"
import { Star } from "lucide-react"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { videoUseCases } from "@/use-cases/video"
import { usePaginatedList } from "@/hooks/use-paginated-list"

export function StarredPage() {
  const isAuthorized = useProtectedRoute("/starred")
  const { items: videos, loading } = usePaginatedList<Video>(
    () => videoUseCases.fetchStarred(),
    (next) => videoUseCases.fetchNext(next)
  )

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Избранные видео</h1>

        {loading ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <VideoCardSkeleton key={`starred-skel-${i}`} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Нет избранных видео</h3>
            <p className="text-sm text-muted-foreground">Отмечайте видео звездочкой, чтобы они появились здесь.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
