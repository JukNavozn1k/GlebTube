

import {Link} from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import {
  getHistory,
  getStarred,
  getUploads,
  getSubscriptions,
  type UploadedVideo,
  clearHistory,
} from "@/lib/glebtube-storage"
import { videos as builtins, type Video } from "@/lib/glebtube-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VideoCard } from "@/components/video-card"
import { Separator } from "@/components/ui/separator"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/use-user"
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

export function ProfilePage() {
  const { user } = useUser()
  const [starred, setStarred] = useState<string[]>([])
  const [history, setHistory] = useState<{ id: string; at: string }[]>([])
  const [uploads, setUploads] = useState<UploadedVideo[]>([])
  const [subs, setSubs] = useState<string[]>([])

  useEffect(() => {
    setStarred(getStarred())
    setHistory(getHistory())
    setUploads(getUploads())
    setSubs(getSubscriptions())
  }, [])

  const all = useMemo<Video[]>(() => [...uploads, ...builtins], [uploads])
  const starredVideos = useMemo(() => all.filter((v) => starred.includes(v.id)), [starred, all])
  const historyVideos = useMemo(() => {
    const map = new Map(all.map((v) => [v.id, v]))
    return history.map((h) => map.get(h.id)).filter(Boolean) as Video[]
  }, [history, all])

  function initials(name: string) {
    const parts = name.trim().split(" ")
    const s = (parts[0]?.[0] || "") + (parts[1]?.[0] || "")
    return s.toUpperCase() || "US"
  }

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <Header />
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-6 grid gap-6">
        <section className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-blue-200">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>GL</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-xl font-semibold">{user.name}</div>
            {user.description ? (
              <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap break-words">{user.description}</p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Описание канала пока не добавлено.{" "}
                <Link to="/profile/settings" className="text-blue-700 hover:underline">
                  Добавить описание
                </Link>
                .
              </p>
            )}
            <div className="mt-2">
              <Link to="/profile/settings">
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
                  Настройки профиля
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Separator />

        <section className="grid gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Мои видео</h2>
            <Link to="/upload">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
                Загрузить
              </Button>
            </Link>
          </div>
          {uploads.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              У вас нет загруженных видео.{" "}
              <Link className="text-blue-700 hover:underline" to="/upload">
                Загрузить видео
              </Link>
              .
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {uploads.map((v) => (
                <div key={v.id} className="relative">
                  <VideoCard video={v} />
                  <Link
                    to={`/video/${v.id}/edit`}
                    className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-white/90 border border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Редактировать
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <Separator />

        <section className="grid gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">История прос��отров</h2>
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
            <div className="text-sm text-muted-foreground">История пуста.</div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {historyVideos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          )}
        </section>

        <Separator />

        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">Подписки</h2>
          {subs.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              У вас нет подписок. Найдите интересные каналы{" "}
              <Link className="text-blue-700 hover:underline" to="/subscriptions">
                в разделе “Подписки”
              </Link>
              .
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {subs.map((c) => (
                <Link
                  key={c}
                  to={`/channel/${encodeURIComponent(c.toLowerCase())}`}
                  className="inline-flex items-center gap-2 rounded-full pr-3 pl-2 py-1 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  title={c}
                >
                  <Avatar className="h-6 w-6 border border-blue-200">
                    <AvatarImage src="/blue-channel-avatar.png" alt={c} />
                    <AvatarFallback className="text-[10px]">{initials(c)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{c}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <Separator />

        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">Избранные (звезды)</h2>
          {starredVideos.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Нет отмеченных звездой видео. Найдите интересное{" "}
              <Link className="text-blue-700 hover:underline" to="/">
                на главной
              </Link>
              .
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {starredVideos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  )
}
