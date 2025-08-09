

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { StarButton } from "@/components/star-button"
import { Comments } from "@/components/comments"
import { videos as builtins, formatViews, timeAgo, type Video } from "@/lib/glebtube-data"
import { getUploads, addHistory, isSubscribed, toggleSubscription } from "@/lib/glebtube-storage"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { CustomPlayer } from "@/components/custom-player"

function channelSlug(name: string) {
  return encodeURIComponent(name.toLowerCase())
}

export default function WatchPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id || ""
  const [video, setVideo] = useState<Video | null>(null)
  const [sub, setSub] = useState(false)

  const uploads = getUploads()
  const allVideos = [...uploads, ...builtins]

  useEffect(() => {
    const v = allVideos.find((x) => x.id === id) || null
    setVideo(v)
    if (v) setSub(isSubscribed(v.channel))
  }, [id])

  useEffect(() => {
    if (video) addHistory(video.id)
  }, [video])

  const recommended = useMemo(() => allVideos.filter((v) => v.id !== id).slice(0, 6), [id])

  if (!video) {
    return (
      <div className="min-h-dvh bg-white overflow-x-hidden">
        <Header />
        <main className="mx-auto max-w-4xl px-3 sm:px-4 py-8">
          <div className="text-lg font-semibold mb-2">Видео не найдено</div>
          <Link href="/" className="text-blue-700 hover:underline">
            Вернуться на главную
          </Link>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0 overflow-x-hidden">
      <Header />
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6 grid gap-6 lg:grid-cols-[1fr_360px] items-start overflow-x-hidden">
        <section className="grid gap-4">
          <CustomPlayer src={video.src} poster={video.thumbnail} title={video.title} />

          <div className="grid gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold">{video.title}</h1>

            {/* Compact channel row with avatar and close metadata */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200" aria-hidden />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/channel/${channelSlug(video.channel)}`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {video.channel}
                  </Link>
                  <Button
                    size="sm"
                    variant={sub ? "default" : "outline"}
                    className={
                      sub
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border-blue-200 text-blue-700 hover:bg-blue-50"
                    }
                    onClick={() => setSub(toggleSubscription(video.channel))}
                  >
                    {sub ? "Вы подписаны" : "Подписаться"}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatViews(video.views)} • {timeAgo(video.createdAt)}
                </div>
              </div>

              <div className="ml-auto">
                <StarButton videoId={video.id} baseCount={video.baseStars} />
              </div>
            </div>

            <DescriptionBlock text={video.description} />
          </div>

          {/* Comments: toggle visible on <lg (phones/tablets) */}
          <div className="lg:hidden">
            <ToggleComments videoId={video.id} />
          </div>
          <div className="hidden lg:block">
            <Comments videoId={video.id} />
          </div>
        </section>

        <aside className="grid gap-4 self-start">
          <div className="text-sm font-semibold">Рекомендованные</div>
          <div className="grid gap-3">
            {recommended.map((v) => (
              <Link key={v.id} href={`/watch/${v.id}`} className="flex gap-3 group">
                <div className="relative aspect-video w-40 min-w-40 rounded-md overflow-hidden bg-blue-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.thumbnail || "/placeholder.svg?height=90&width=160&query=video%20thumb%20blue%20white"}
                    alt={`Thumbnail ${v.title}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-white text-[10px]">
                    {v.duration}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="line-clamp-2 text-sm font-medium group-hover:text-blue-700">{v.title}</div>
                  <div className="text-xs text-muted-foreground">{v.channel}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatViews(v.views)} • {timeAgo(v.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </main>
      <BottomNav />
    </div>
  )
}

function ToggleComments({ videoId }: { videoId: string }) {
  const [open, setOpen] = useState(false) // default open on tablets/phones
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

function DescriptionBlock({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const isLong = text.length > 180
  return (
    <div className="mt-2">
      <div className="text-sm font-semibold mb-1">Описание</div>
      <div className={!open && isLong ? "line-clamp-3 text-sm text-gray-700" : "text-sm text-gray-700"}>{text}</div>
      {isLong && (
        <button
          className="mt-1 text-sm text-blue-700 hover:underline"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "Скрыть" : "Показать полностью"}
        </button>
      )}
    </div>
  )
}
