
import { useEffect, useMemo, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { getSubscriptions, getUploads, type UploadedVideo } from "@/lib/glebtube-storage"
import { videos as builtins, type Video } from "@/lib/glebtube-data"
import { ChannelCard } from "@/components/channel-card"
import { useProtectedRoute } from "@/hooks/use-protected-route"

export  function SubscriptionsPage() {
  const isAuthorized = useProtectedRoute("/subscriptions")
  const [subs, setSubs] = useState<string[]>([])
  const [uploads, setUploads] = useState<UploadedVideo[]>([])

  useEffect(() => {
    if (isAuthorized) {
      setSubs(getSubscriptions())
      setUploads(getUploads())
    }
  }, [isAuthorized])

  const all: Video[] = useMemo(() => [...uploads, ...builtins], [uploads])

  const channels = useMemo(() => {
    const map = new Map<string, Video[]>()
    for (const v of all) {
      if (!subs.includes(v.channel)) continue
      if (!map.has(v.channel)) map.set(v.channel, [])
      map.get(v.channel)!.push(v)
    }
    return Array.from(map.entries()).map(([channel, videos]) => ({ channel, videos }))
  }, [subs, all])

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-5xl px-3 sm:px-4 py-6 grid gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold">Мои подписки</h1>
        {channels.length === 0 ? (
          <div className="text-sm text-muted-foreground">Вы пока ни на кого не подписаны.</div>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {channels.map((ch) => (
              <ChannelCard key={ch.channel} channel={ch.channel} videos={ch.videos} />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
