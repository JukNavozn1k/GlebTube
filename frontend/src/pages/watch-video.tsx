import { useCallback, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { StarButton } from "@/components/star-button"
import { Comments } from "@/components/comments"

import { formatViews, timeAgo, formatDuration } from "@/utils/format"
import type { Video } from "@/types/video"
import { addHistory } from "@/utils/storage"

import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { CustomPlayer } from "@/components/custom-player"
import { ChevronDown, ChevronUp } from "lucide-react"
import { WatchPageSkeleton } from "@/components/watch-skeleton"

import { videoUseCases } from "@/use-cases/video"
import { userUseCases } from "@/use-cases/user"
import { usePaginatedList } from "@/hooks/use-paginated-list"
// page size is provided by usePaginatedList

function channelSlug(channelId: string) {
  return encodeURIComponent(channelId || "unknown")
}

function getInitials(username?: string): string {
  if (!username || typeof username !== "string") return "CH"
  return (
    username
      .trim()
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CH"
  )
}

export function WatchPage() {
  const { id = "" } = useParams<{ id: string }>()
  const [video, setVideo] = useState<Video | null>(null)
  const [sub, setSub] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Theater mode was removed from CustomPlayer; keep layout static

  // Paginated recommendations (similar videos)
  const loadSimilarFirst = useCallback(() => videoUseCases.fetchSimilar(id), [id])
  const loadSimilarNext = useCallback((nextUrl: string) => videoUseCases.fetchNext(nextUrl), [])
  const { items: recommended, reload: reloadRecommended, pageSize: recPageSize, hasNext: recHasNext, sentinelRef: recSentinelRef } = usePaginatedList<Video>(
    loadSimilarFirst,
    loadSimilarNext,
  )

  useEffect(() => {
    const didRef = (WatchPage as any)._didRef || { current: new Map<string, boolean>() }
    ;(WatchPage as any)._didRef = didRef
    const loadVideo = async () => {
      setIsLoading(true)
      try {
        const v = await videoUseCases.fetchById(id)
        setVideo(v)
        if (v?.channel) setSub(!!v.channel.subscribed)
      } catch (error) {
        console.error("Failed to load video:", error)
        setVideo(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadVideo()
    // reset and load recommendations for new id; guard StrictMode duplicate for same id
    const key = String(id)
    const seen = didRef.current.get(key)
    if (!seen) {
      didRef.current.set(key, true)
      reloadRecommended()
    }
  }, [id, reloadRecommended])

  useEffect(() => {
    if (video) addHistory(video.id)
  }, [video])

  if (isLoading) {
    return <WatchPageSkeleton />
  }

  if (!video || !video.channel) {
    return (
      <div className="min-h-dvh bg-white overflow-x-hidden">
        <main className="mx-auto max-w-4xl px-3 sm:px-4 py-8">
          <div className="text-lg font-semibold mb-2">Видео не найдено</div>
          <Link to="/" className="text-blue-700 hover:underline">
            Вернуться на главную
          </Link>
        </main>
        <BottomNav />
      </div>
    )
  }

  const containerWidth = "max-w-6xl"
  const gridCols = "lg:grid-cols-[1fr_360px]"

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0 overflow-x-hidden">
      <main
        className={`mx-auto ${containerWidth} px-3 sm:px-4 py-4 sm:py-6 grid gap-6 ${gridCols} items-start overflow-x-hidden`}
      >
        <section className="grid gap-4 min-w-0">
          <CustomPlayer
            src={video.src}
            poster={video.thumbnail}
            title={video.title}
            hlsUrl={video.status === 'Completed' ? videoUseCases.hlsUrl(video.id) : undefined}
          />

          <div className="grid gap-4 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold break-words hyphens-auto overflow-wrap-anywhere">
              {video.title}
            </h1>

            {/* Channel info with subscription button aligned */}
            <div className="flex items-start gap-3 min-w-0">
              <Link to={`/channel/${channelSlug(video.channel.id)}`} className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full overflow-hidden border border-blue-200 bg-blue-50 flex items-center justify-center">
                  {video.channel.avatar ? (
                    <img
                      src={video.channel.avatar || "/placeholder.svg"}
                      alt={`${video.channel.username || "Channel"} avatar`}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-blue-700">{getInitials(video.channel.username)}</span>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <Link
                    to={`/channel/${channelSlug(video.channel.id)}`}
                    className="font-medium text-blue-700 hover:underline break-words"
                  >
                    <span>{video.channel.username || "Unknown Channel"}</span>
                  </Link>
                  <Button
                    size="sm"
                    variant={sub ? "default" : "outline"}
                    className={
                      sub
                        ? "bg-blue-600 text-white hover:bg-blue-700 flex-shrink-0"
                        : "border-blue-200 text-blue-700 hover:bg-blue-50 flex-shrink-0"
                    }
                    onClick={async () => {
                      try {
                        const res = await userUseCases.subscribe(video.channel.id)
                        setSub(res.subscribed)
                        // Update local video object flag to keep UI consistent
                        if (video.channel) {
                          video.channel.subscribed = res.subscribed
                        }
                      } catch (e) {
                        console.error("Failed to toggle subscription:", e)
                      }
                    }}
                  >
                    {sub ? "Вы подписаны" : "Подписаться"}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatViews(video.views)} просмотров • {timeAgo(video.createdAt)}
                </div>
              </div>
              <div className="flex-shrink-0">
                <StarButton video={video.id} starred={video.starred} baseCount={video.baseStars} />
              </div>
            </div>

            <ExpandableDescription text={video.description} />
          </div>

          {/* Comments: toggle visible on <lg (phones/tablets) */}
          <div className="lg:hidden min-w-0">
            <ToggleComments video={video.id} />
          </div>
          <div className="hidden lg:block min-w-0">
            <Comments video={video.id} />
          </div>
        </section>

        <aside className="grid gap-4 self-start min-w-0">
          <div className="text-sm font-semibold">Рекомендованные</div>
          <div className="grid gap-3">
            {recommended.filter((rv) => rv.id !== id).map((v) => {
              if (!v.channel) return null

              return (
                <Link key={v.id} to={`/watch/${v.id}`} className="flex gap-3 group min-w-0">
                  <div className="relative aspect-video w-40 min-w-40 rounded-md overflow-hidden bg-blue-50 flex-shrink-0">
                    <img
                      src={v.thumbnail || "/placeholder.svg?height=90&width=160&query=video%20thumb%20blue%20white"}
                      alt={`Thumbnail ${v.title}`}
                      width={160}
                      height={90}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-white text-[10px]">
                      {formatDuration(v.duration)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-sm font-medium group-hover:text-blue-700 break-words hyphens-auto">
                      {v.title}
                    </div>
                    <div className="text-xs text-muted-foreground break-words">
                      <span>{v.channel.username || "Unknown Channel"}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatViews(v.views)} просмотров • {timeAgo(v.createdAt)}
                    </div>
                  </div>
                </Link>
              )
            })}
            {recHasNext &&
              Array.from({ length: Math.max(1, recPageSize) }).map((_, i) => (
                i === 0 ? (
                  <div key={`rec-tail-sentinel-wrap-${i}`} ref={recSentinelRef} className="flex gap-3 min-w-0 animate-pulse">
                    <div className="aspect-video w-40 min-w-40 rounded-md bg-blue-50" />
                    <div className="flex-1 min-w-0 grid gap-2">
                      <div className="h-3 bg-slate-100 rounded w-11/12" />
                      <div className="h-3 bg-slate-100 rounded w-8/12" />
                      <div className="h-3 bg-slate-100 rounded w-6/12" />
                    </div>
                  </div>
                ) : (
                  <div key={`rec-tail-skel-${i}`} className="flex gap-3 min-w-0 animate-pulse">
                    <div className="aspect-video w-40 min-w-40 rounded-md bg-blue-50" />
                    <div className="flex-1 min-w-0 grid gap-2">
                      <div className="h-3 bg-slate-100 rounded w-11/12" />
                      <div className="h-3 bg-slate-100 rounded w-8/12" />
                      <div className="h-3 bg-slate-100 rounded w-6/12" />
                    </div>
                  </div>
                )
              ))}
          </div>
        </aside>
      </main>
      <BottomNav />
    </div>
  )
}

function ToggleComments({ video }: { video: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="grid gap-2">
      <Button
        variant="outline"
        className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Скрыть комментарии" : "Показать комментарии"}
      </Button>
      {open && <Comments video={video} />}
    </div>
  )
}

function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > 150
  const shouldTruncate = isLong && !expanded

  return (
    <div className="bg-gray-50 rounded-lg p-4 min-w-0">
      <div className="text-sm font-semibold mb-2">Описание</div>
      <div
        className={
          shouldTruncate
            ? "text-sm text-gray-700 break-words hyphens-auto overflow-wrap-anywhere line-clamp-2"
            : "text-sm text-gray-700 whitespace-pre-wrap break-words hyphens-auto overflow-wrap-anywhere"
        }
      >
        {text || "Описание отсутствует."}
      </div>
      {isLong && (
        <button
          className="mt-3 flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800 font-medium transition-colors"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Свернуть
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Показать полностью
            </>
          )}
        </button>
      )}
    </div>
  )
}