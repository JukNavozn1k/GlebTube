
import { useEffect, useMemo, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { getSubscriptions, getUploads } from "@/utils/storage"
import { videos as builtins } from "@/lib/glebtube-data"
import { ChannelCard } from "@/components/channel-card"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { getChannelById } from "@/data/channels"
import type { User } from "@/types/user"
import type {Video} from "@/types/video"
export function SubscriptionsPage() {
  const isAuthorized = useProtectedRoute("/subscriptions")
  const [subs, setSubs] = useState<string[]>([])
  const [uploads, setUploads] = useState<Video[]>([])

  useEffect(() => {
    if (isAuthorized) {
      setSubs(getSubscriptions())
      setUploads(getUploads())
    }
  }, [isAuthorized])

  const all: Video[] = useMemo(() => [...uploads, ...builtins], [uploads])

  const channels = useMemo(() => {
    const map = new Map<string, { channel: User; videos: Video[] }>()

    for (const v of all) {
      if (!v.channel?.id || !subs.includes(v.channel.id)) continue

      const channelId = v.channel.id
      if (!map.has(channelId)) {
        const channelData = getChannelById(channelId) || v.channel
        map.set(channelId, { channel: channelData, videos: [] })
      }
      map.get(channelId)!.videos.push(v)
    }

    return Array.from(map.values())
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
              <ChannelCard key={ch.channel.id} channel={ch.channel} videos={ch.videos} />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
