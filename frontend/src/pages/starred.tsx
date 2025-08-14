
import { useEffect, useMemo, useState } from "react"
import { getStarred } from "@/utils/storage"
import { videos as builtins } from "@/data/videos"
import { type Video, type UploadedVideo } from "@/types/video"
import { getUploads } from "@/utils/storage"
import { VideoCard } from "@/components/video-card"
import { BottomNav } from "@/components/bottom-nav"
import { Star } from "lucide-react"
import { useProtectedRoute } from "@/hooks/use-protected-route"

export function StarredPage() {
  const isAuthorized = useProtectedRoute("/starred")
  const [starred, setStarred] = useState<string[]>([])
  const [uploads, setUploads] = useState<UploadedVideo[]>([])

  useEffect(() => {
    if (isAuthorized) {
      setStarred(getStarred())
      setUploads(getUploads())
    }
  }, [isAuthorized])

  const all = useMemo<Video[]>(() => [...uploads, ...builtins], [uploads])
  const starredVideos = useMemo(() => all.filter((v) => starred.includes(v.id)), [starred, all])

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Избранные видео</h1>

        {starredVideos.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Нет избранных видео</h3>
            <p className="text-sm text-muted-foreground">Отмечайте видео звездочкой, чтобы они появились здесь.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {starredVideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
