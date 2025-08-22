import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom" // <-- заменено
import { formatViews } from "@/utils/format"
import { isSubscribed } from "@/utils/storage"
import { Button } from "@/components/ui/button"
import { VideoCard } from "@/components/video-card"
import { VideoCardSkeleton } from "@/components/video-card-skeleton"
import { BottomNav } from "@/components/bottom-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChannelPageSkeleton } from "@/components/channel-page-skeleton"

import { Calendar, Users, VideoIcon } from "lucide-react"
import type { User } from "@/types/user"
import type { Video } from "@/types/video"
import { userUseCases } from "@/use-cases/user"
import { videoUseCases } from "@/use-cases/video"
import { useUser } from "@/hooks/use-user"
import { usePaginatedList } from "@/hooks/use-paginated-list"
function nameFromSlug(slug: string) {
  return decodeURIComponent(String(slug))
}

function initials(username?: string) {
  if (!username || typeof username !== "string") return "CH"
  const parts = username.trim().split(" ")
  const s = (parts[0]?.[0] || "") + (parts[1]?.[0] || "")
  return s.toUpperCase() || "CH"
}

export function ChannelPage() {
  const { slug } = useParams<{ slug: string }>() // <-- react-router-dom
  const [channel, setChannel] = useState<User | null>(null)
  // videos are now provided by paginated hook
  const [loading, setLoading] = useState(false)
  const { user } = useUser()

  // Fetch channel info (not paginated)
  useEffect(() => {
    const id = nameFromSlug(slug || "")
    if (!id) {
      setChannel(null)
      return
    }
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const usr = await userUseCases.fetchById(id)
        if (!cancelled) setChannel(usr)
      } catch (e) {
        if (!cancelled) setChannel(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  // Paginated videos for channel
  const channelId = useMemo(() => nameFromSlug(slug || ""), [slug])
  const loadFirst = useCallback(() => videoUseCases.fetchByChannel(channelId), [channelId])
  const loadNext = useCallback((nextUrl: string) => videoUseCases.fetchNext(nextUrl), [])
  const { items: videos, loading: listLoading, reload, pageSize, hasNext, sentinelRef } = usePaginatedList<Video>(loadFirst, loadNext)

  // Reload videos when channel changes
  useEffect(() => {
    if (!channelId) return
    reload()
  }, [channelId, reload])

  const [sub, setSub] = useState(false)
  useEffect(() => {
    // initialize from server-provided flag when channel changes
    if (channel && typeof channel.subscribed === "boolean") setSub(!!channel.subscribed)
    else setSub(isSubscribed(channel?.id || ""))
  }, [channel?.id])

  const sortedVideos = useMemo(() => {
    return [...videos].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [videos])

  const subscriberCount = channel?.subscriberCount ?? 0
  const joinYear = channel?.joinedAt ? new Date(channel.joinedAt).getFullYear() : 2023

  if (loading) {
    return <ChannelPageSkeleton />
  }

  if (!channel) {
    return (
      <div className="min-h-dvh bg-white pb-14 sm:pb-0 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-3 sm:px-4 py-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">Канал не найден</h1>
            <p className="text-muted-foreground">Указанный канал не существует.</p>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0 overflow-x-hidden">
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-6">
        {/* Channel Header */}
        <section className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-blue-200 flex-shrink-0">
              <AvatarImage src={channel?.avatar || "/blue-channel-avatar.png"} alt={channel?.username || "Channel"} />
              <AvatarFallback className="text-lg">{initials(channel?.username || "")}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold break-words hyphens-auto overflow-wrap-anywhere">
                  {channel?.username || "Unknown Channel"}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>{formatViews(subscriberCount)} подписчиков</span>
                </div>
                <div className="flex items-center gap-1">
                  <VideoIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{channel?.videoCount ?? 0} видео</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Дата регистрации: {joinYear}</span>
                </div>
              </div>
            </div>
            {String(user.id) !== String(channel?.id) && (
            <Button
              size="sm"
              variant={sub ? "default" : "outline"}
              className={
                sub ? "bg-blue-600 text-white hover:bg-blue-700" : "border-blue-200 text-blue-700 hover:bg-blue-50"
              }
              onClick={async () => {
                try {
                  const res = await userUseCases.subscribe(channel!.id)
                  setSub(res.subscribed)
                } catch (e) {
                  console.error("Failed to toggle subscription:", e)
                }
              }}
            >
              {sub ? "Подписан" : "Подписаться"}
            </Button>
          )}
          </div>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="videos" className="flex items-center gap-1 py-1.5 px-2">
              <VideoIcon className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs hidden md:inline">Видео</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-1 py-1.5 px-2">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs hidden md:inline">О канале</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-0">
            {loading || listLoading ? (
              <div className="text-sm text-muted-foreground">Загрузка...</div>
            ) : sortedVideos.length === 0 ? (
              <div className="text-center py-12">
                <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Нет видео</h3>
                <p className="text-sm text-muted-foreground">У этого канала пока нет опубликованных видео.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {sortedVideos.map((v) => (
                  <VideoCard key={v.id} video={v} showChannelAvatar={false} />
                ))}
                {hasNext && (
                  <div ref={sentinelRef} className="contents">
                    {Array.from({ length: Math.max(1, pageSize) }).map((_, i) => (
                      <VideoCardSkeleton key={`channel-tail-skel-${i}`} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-0">
            <div className="max-w-4xl">
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Описание канала</h3>
                <p className="text-gray-700 whitespace-pre-wrap break-words hyphens-auto overflow-wrap-anywhere">
                  {channel.bio ||
                    `Добро пожаловать на канал ${channel.username || "Unknown Channel"}! Здесь вы найдете интересный контент и полезную информацию.`}
                </p>
              </div>
            </div>
          </TabsContent>

          
        </Tabs>
      </main>
      <BottomNav />
    </div>
  )
}
