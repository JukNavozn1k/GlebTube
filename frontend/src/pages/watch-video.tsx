import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { StarButton } from "@/components/star-button"
import { Comments } from "@/components/comments"

import { formatViews, formatDuration, timeAgo } from "@/utils/format"
import type { Video } from "@/types/video"
import { addHistory, isSubscribed, toggleSubscription } from "@/utils/storage"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { CustomPlayer } from "@/components/custom-player"
import { ChevronDown, ChevronUp } from "lucide-react"

import { VideoUseCase } from "@/use-cases/video-use-case"

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
  const [recommended, setRecommended] = useState<Video[]>([])
  const [sub, setSub] = useState(false)
  const [theater, setTheater] = useState(false)
  const videoUseCase = useMemo(() => new VideoUseCase(), [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [v, list] = await Promise.all([
          videoUseCase.fetchById(id),
          videoUseCase.fetchList()
        ]);
        setVideo(v);
        setRecommended(list.filter((item) => item.id !== id).slice(0, 6));
        if (v?.channel?.id) setSub(isSubscribed(v.channel.id));
      } catch (error) {
        console.error("Failed to load video or recommendations:", error);
        setVideo(null);
        setRecommended([]);
      }
    };
    loadData();
  }, [id])

  useEffect(() => {
    if (video) addHistory(video.id)
  }, [video])

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

  const containerWidth = theater ? "max-w-7xl" : "max-w-6xl"
  const gridCols = theater ? "lg:grid-cols-1" : "lg:grid-cols-[1fr_360px]"

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
            theater={theater}
            onToggleTheater={() => setTheater((v) => !v)}
          />

          <div className="grid gap-4 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold break-words hyphens-auto overflow-wrap-anywhere">
              {video.title}
            </h1>

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
                    onClick={() => setSub(toggleSubscription(video.channel.id))}
                  >
                    {sub ? "Вы подписаны" : "Подписаться"}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatViews(video.views)} просмотров • {timeAgo(video.createdAt)}
                </div>
              </div>
              <div className="flex-shrink-0">
                <StarButton videoId={video.id} baseCount={video.baseStars} />
              </div>
            </div>

            <ExpandableDescription text={video.description} />
          </div>

          <div className="lg:hidden min-w-0">
            <ToggleComments videoId={video.id} />
          </div>
          <div className="hidden lg:block min-w-0">
            <Comments videoId={video.id} />
          </div>
        </section>

        <aside className="grid gap-4 self-start min-w-0">
          <div className="text-sm font-semibold">Рекомендованные</div>
          <div className="grid gap-3">
            {recommended.map((v) => {
              if (!v.channel) return null

              return (
                <Link key={v.id} to={`/watch/${v.id}`} className="flex gap-3 group min-w-0">
                  <div className="relative aspect-video w-40 min-w-40 rounded-md overflow-hidden bg-blue-50 flex-shrink-0">
                    <img
                      src={
                        v.thumbnail ||
                        "/placeholder.svg?height=90&width=160&query=video%20thumb%20blue%20white"
                      }
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
          </div>
        </aside>
      </main>
      <BottomNav />
    </div>
  )
}

function ToggleComments({ videoId }: { videoId: string }) {
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
      {open && <Comments videoId={videoId} />}
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