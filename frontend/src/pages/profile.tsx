
import {Link} from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { getHistory, getStarred, getUploads, getSubscriptions, clearHistory } from "@/utils/storage"
import { videos as builtins} from "@/data/videos"
import { type Video, type UploadedVideo } from "@/types/video"
import { formatViews } from "@/utils/format"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VideoCard } from "@/components/video-card"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/use-user"
import { useProtectedRoute } from "@/hooks/use-protected-route"
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
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoIcon, Star, History, Users, Upload, Settings, LogOut, Edit } from "lucide-react"

export function ProfilePage() {
  const { user } = useUser()
  const { logout } = useAuth()
  const isAuthorized = useProtectedRoute("/profile")
  const [starred, setStarred] = useState<string[]>([])
  const [history, setHistory] = useState<{ id: string; at: string }[]>([])
  const [uploads, setUploads] = useState<UploadedVideo[]>([])
  const [subs, setSubs] = useState<string[]>([])
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false)

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

  const totalViews = uploads.reduce((sum, v) => sum + v.views, 0)

  useEffect(() => {
    if (isAuthorized) {
      setStarred(getStarred())
      setHistory(getHistory())
      setUploads(getUploads())
      setSubs(getSubscriptions())
    }
  }, [isAuthorized])

  // Если не авторизован, не рендерим содержимое
  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6">
        {/* Profile Header */}
        <section className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 border-2 border-blue-200">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-sm sm:text-lg">GL</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{user.name}</h1>
              {user.description ? (
                <div
                  className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-700 line-clamp-2"
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    whiteSpace: "pre-wrap",
                    hyphens: "auto",
                  }}
                >
                  {user.description}
                </div>
              ) : (
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                  Описание канала пока не добавлено.{" "}
                  <Link to="/profile/settings" className="text-blue-700 hover:underline">
                    Добавить описание
                  </Link>
                  .
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <VideoIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{uploads.length} видео</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{subs.length} подписок</span>
                </div>
                {totalViews > 0 && (
                  <div className="flex items-center gap-1">
                    <span>{formatViews(totalViews)} просмотров</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link to="/profile/settings" className="flex-1 sm:flex-none">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Настройки</span>
                </Button>
              </Link>
              <AlertDialog open={confirmLogoutOpen} onOpenChange={setConfirmLogoutOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex-1 sm:flex-none">
                    <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Выйти</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Выйти из аккаунта?</AlertDialogTitle>
                    <AlertDialogDescription>Подтвердите выход из учётной записи.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => {
                        setConfirmLogoutOpen(false)
                        setTimeout(() => {
                          logout()
                        }, 0)
                      }}
                    >
                      Выйти
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-6">
            <TabsTrigger value="videos" className="flex items-center gap-1 py-1.5 px-2">
              <VideoIcon className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs hidden md:inline">Мои видео</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1 py-1.5 px-2">
              <History className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs hidden md:inline">История</span>
            </TabsTrigger>
            <TabsTrigger value="starred" className="flex items-center gap-1 py-1.5 px-2">
              <Star className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs hidden md:inline">Избранное</span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-1 py-1.5 px-2">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs hidden md:inline">Подписки</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Мои видео</h2>
              <Link to="/upload">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Загрузить</span>
                  <span className="sm:hidden">+</span>
                </Button>
              </Link>
            </div>
            {uploads.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <VideoIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Нет видео</h3>
                <p className="text-sm text-muted-foreground mb-3 sm:mb-4 px-4">
                  У вас нет загруженных видео. Загрузите свое первое видео!
                </p>
                <Link to="/upload">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Загрузить видео
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {uploads.map((v) => (
                  <div key={v.id} className="relative group">
                    <VideoCard video={v} />
                    <Link
                      to={`/video/${v.id}/edit`}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 hover:bg-white border border-gray-200 hover:border-blue-300 flex items-center justify-center text-gray-600 hover:text-blue-700 transition-all shadow-sm opacity-0 group-hover:opacity-100 sm:opacity-100"
                      title="Редактировать видео"
                      aria-label="Редактировать видео"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">История просмотров</h2>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                  >
                    <span className="hidden sm:inline">Очистить историю</span>
                    <span className="sm:hidden">Очистить</span>
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
              <div className="text-center py-8 sm:py-12">
                <History className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">История пуста</h3>
                <p className="text-sm text-muted-foreground px-4">Просмотренные видео будут отображаться здесь.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {historyVideos.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="starred" className="mt-0">
            <h2 className="text-lg font-semibold mb-4">Избранные видео</h2>
            {starredVideos.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Star className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Нет избранных видео</h3>
                <p className="text-sm text-muted-foreground px-4">
                  Отмечайте видео звездочкой, чтобы они появились здесь.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {starredVideos.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-0">
            <h2 className="text-lg font-semibold mb-4">Мои подписки</h2>
            {subs.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Нет подписок</h3>
                <p className="text-sm text-muted-foreground mb-3 sm:mb-4 px-4">
                  Подпишитесь на интересные каналы, чтобы не пропускать новые видео.
                </p>
                <Link to="/channels">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Найти каналы
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                {subs.map((c) => (
                  <Link
                    key={c}
                    to={`/channel/${encodeURIComponent(c.toLowerCase())}`}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors"
                  >
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border border-blue-200">
                      <AvatarImage src="/blue-channel-avatar.png" alt={c} />
                      <AvatarFallback className="text-xs sm:text-sm">{initials(c)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-1 text-sm sm:text-base">{c}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Канал</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  )
}
