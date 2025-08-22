
import { useEffect, useMemo, useRef, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { getUploads } from "@/utils/storage"
import { videos as builtins } from "@/lib/glebtube-data"
import { ChannelCard } from "@/components/channel-card"
import { ChannelCardSkeleton } from "@/components/channel-card-skeleton"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import type { User } from "@/types/user"
import type { Video } from "@/types/video"
import { userUseCases } from "@/use-cases/user"
import { usePaginatedList } from "@/hooks/use-paginated-list"
export function SubscriptionsPage() {
  const isAuthorized = useProtectedRoute("/subscriptions")
  const [uploads, setUploads] = useState<Video[]>([])
  const { items: subscribedUsers, loading, reload, pageSize } = usePaginatedList<User>(
    () => userUseCases.fetchSubscriptions(),
    (next) => userUseCases.fetchNext(next)
  )

  const didInitRef = useRef(false)
  useEffect(() => {
    if (!isAuthorized) {
      didInitRef.current = false
      return
    }
    setUploads(getUploads())
    if (didInitRef.current) return
    didInitRef.current = true
    reload()
  }, [isAuthorized, reload])

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
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {Array.from({ length: Math.max(1, pageSize) }).map((_, i) => (
              <ChannelCardSkeleton key={`subs-skel-${i}`} />
            ))}
          </div>
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
