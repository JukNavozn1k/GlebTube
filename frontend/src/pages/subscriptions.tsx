
import { useEffect, useMemo, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { getUploads } from "@/utils/storage"
import { videos as builtins } from "@/lib/glebtube-data"
import { ChannelCard } from "@/components/channel-card"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import type { User } from "@/types/user"
import type { Video } from "@/types/video"
import { userUseCases } from "@/use-cases/user"
export function SubscriptionsPage() {
  const isAuthorized = useProtectedRoute("/subscriptions")
  const [subscribedUsers, setSubscribedUsers] = useState<User[]>([])
  const [uploads, setUploads] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthorized) return
    setUploads(getUploads())
    setLoading(true)
    ;(async () => {
      try {
        const users = await userUseCases.fetchSubscriptions()
        setSubscribedUsers(users)
      } catch (e) {
        console.error("Failed to fetch subscriptions", e)
      } finally {
        setLoading(false)
      }
    })()
  }, [isAuthorized])

  const all: Video[] = useMemo(() => [...uploads, ...builtins], [uploads])

  const channels = useMemo(() => {
    return subscribedUsers.map((u) => ({
      channel: u,
      videos: all.filter((v) => v.channel?.id === u.id),
    }))
  }, [subscribedUsers, all])

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-5xl px-3 sm:px-4 py-6 grid gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold">Мои подписки</h1>
        {loading ? (
          <div className="text-sm text-muted-foreground">Загрузка...</div>
        ) : channels.length === 0 ? (
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
