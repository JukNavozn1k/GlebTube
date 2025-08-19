import { useEffect, useState } from "react"
import { type Video} from "@/types/video" 
import { VideoCard } from "@/components/video-card"
import { BottomNav } from "@/components/bottom-nav"
import { Star } from "lucide-react"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { videoUseCases } from "@/use-cases/video"

export function StarredPage() {
  const isAuthorized = useProtectedRoute("/starred")
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthorized) return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const list = await videoUseCases.fetchStarred()
        if (!cancelled) setVideos(list)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthorized])

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Избранные видео</h1>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
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
