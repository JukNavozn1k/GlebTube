
import { useEffect, useMemo, useState } from "react"
import { getHistory, clearHistory } from "@/utils/storage"
import { videos as builtins,  } from "@/data/videos"
import { getUploads } from "@/utils/storage"
import {type UploadedVideo, type Video } from "@/types/video"
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

export function HistoryPage() {
  const isAuthorized = useProtectedRoute("/history")
  const [history, setHistory] = useState<{ id: string; at: string }[]>([])
  const [uploads, setUploads] = useState<UploadedVideo[]>([])

  useEffect(() => {
    if (isAuthorized) {
      setHistory(getHistory())
      setUploads(getUploads())
    }
  }, [isAuthorized])

  const all = useMemo<Video[]>(() => [...uploads, ...builtins], [uploads])
  const historyVideos = useMemo(() => {
    const map = new Map(all.map((v) => [v.id, v]))
    return history.map((h) => map.get(h.id)).filter(Boolean) as Video[]
  }, [history, all])

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
                  onClick={() => {
                    clearHistory()
                    setHistory([])
                  }}
                >
                  Очистить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {historyVideos.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">История пуста</h3>
            <p className="text-sm text-muted-foreground">Просмотренные видео будут отображаться здесь.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {historyVideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
