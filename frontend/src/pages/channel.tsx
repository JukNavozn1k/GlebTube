

import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Header } from "@/components/header"
import { videos as builtins, type Video } from "@/lib/glebtube-data"
import { getUploads, isSubscribed, toggleSubscription } from "@/lib/glebtube-storage"
import { Button } from "@/components/ui/button"
import { VideoCard } from "@/components/video-card"
import { BottomNav } from "@/components/bottom-nav"

function nameFromSlug(slug: string) {
  return decodeURIComponent(String(slug)).toLowerCase()
}

export default function ChannelPage() {
  const { slug = "" } = useParams<{ slug: string }>()
  const uploads = getUploads()
  const all: Video[] = useMemo(() => [...uploads, ...builtins], [uploads])
  const channelNameLower = nameFromSlug(slug)
  const channelVideos = all.filter((v) => v.channel.toLowerCase() === channelNameLower)
  const channelName = channelVideos[0]?.channel || decodeURIComponent(slug)
  const [sub, setSub] = useState(isSubscribed(channelName))

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <Header />
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-6 grid gap-6">
        <section className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-blue-100 border border-blue-200" aria-hidden />
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold">{channelName}</h1>
          </div>
          <Button
            size="sm"
            variant={sub ? "default" : "outline"}
            className={
              sub ? "bg-blue-600 text-white hover:bg-blue-700" : "border-blue-200 text-blue-700 hover:bg-blue-50"
            }
            onClick={() => setSub(toggleSubscription(channelName))}
          >
            {sub ? "Вы подписаны" : "Подписаться"}
          </Button>
        </section>

        <section className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {channelVideos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
          {channelVideos.length === 0 && (
            <div className="text-sm text-muted-foreground">У этого канала пока нет видео.</div>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  )
}
