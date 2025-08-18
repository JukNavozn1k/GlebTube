import { useEffect, useState } from "react"
import { type Video } from "@/types/video"
import { VideoCard } from "@/components/video-card"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { History } from "lucide-react"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { videoUseCases } from "@/use-cases/video"

export function HistoryPage() {
  const isAuthorized = useProtectedRoute("/history")
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthorized) return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const list = await videoUseCases.fetchHistory()
        console.log(list)
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">История просмотров</h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
                Очистить историю
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Очистить историю просмотров?</AlertDialogTitle>
                <AlertDialogDescription>
                  Действие необратимо. Вся история будет удалена на этом устройстве.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={async () => {
                    await videoUseCases.clearHistory()
                    setVideos([])
                  }}
                >
                  Очистить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">История пуста</h3>
            <p className="text-sm text-muted-foreground">Просмотренные видео будут отображаться здесь.</p>
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
