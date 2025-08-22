import type React from "react"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { Input } from "@/components/ui/input"
import { videos as builtins } from "@/lib/glebtube-data"
import { getUploads } from "@/lib/glebtube-storage"
import { type Video, type UploadedVideo } from "@/types/video"
import { ChannelCard } from "@/components/channel-card"
import { ChannelCardSkeleton } from "@/components/channel-card-skeleton"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { User } from "@/types/user"
import { userUseCases } from "@/use-cases/user"
import { userApi } from "@/api/user"
import { usePaginatedList } from "@/hooks/use-paginated-list"
// page size is provided by usePaginatedList

export function ChannelsPage() {
  const [uploads, setUploads] = useState<UploadedVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  const qParam = (searchParams.get("q") || "").trim()
  const [q, setQ] = useState(qParam)

  useEffect(() => setUploads(getUploads()), [])
  // Users pagination with optional search filter by username
  const loadUsersFirst = useCallback(
    () => userApi.listByFilter({ username: qParam || undefined }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [qParam],
  )
  const loadUsersNext = useCallback((nextUrl: string) => userUseCases.fetchNext(nextUrl), [])
  const { items: users, count, loading: usersLoading, reload, pageSize, hasNext, sentinelRef } = usePaginatedList<User>(
    loadUsersFirst,
    loadUsersNext,
  )
  useEffect(() => {
    // reflect initial loading for page-level skeletons
    setLoading(usersLoading)
  }, [usersLoading])
  const lastKeyRef = useRef<string | null>(null)
  useEffect(() => {
    setQ(qParam)
    const key = qParam
    if (lastKeyRef.current === key) return
    lastKeyRef.current = key
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam])

  const all: Video[] = useMemo(() => [...uploads, ...builtins], [uploads])

  const grouped = useMemo(() => {
    // Build list from real users; attach their videos from available lists
    let channelList = users.map((u) => ({
      channel: u,
      videos: all.filter((v) => v.channel.id === u.id),
    }))

    // Filter by search query
    if (q) {
      const qc = q.toLowerCase()
      channelList = channelList.filter(
        (item) =>
          (item.channel.username && item.channel.username.toLowerCase().includes(qc)) ||
          (item.channel.bio && item.channel.bio.toLowerCase().includes(qc))
      )
    }

    // Sort: by number of videos desc, then by username asc
    channelList.sort((a, b) => {
      const videoCountDiff = b.videos.length - a.videos.length
      if (videoCountDiff !== 0) return videoCountDiff
      return a.channel.username.localeCompare(b.channel.username)
    })

    return channelList
  }, [users, all, q])

  function onSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const target = q.trim()
    if (target) {
      setSearchParams({ q: target })
    } else {
      setSearchParams({})
    }
  }

  function onClear() {
    setQ("")
    setSearchParams({})
  }

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-5xl px-3 sm:px-4 py-6 grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold">Каналы</h1>
          <div className="text-sm text-muted-foreground">
            {(typeof count === "number" ? count : grouped.length)}
            {" "}
            {(typeof count === "number" ? count : grouped.length) === 1
              ? "канал"
              : (typeof count === "number" ? count : grouped.length) < 5
              ? "канала"
              : "каналов"}
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск каналов"
            className="max-w-xl rounded-full border-blue-200 focus-visible:ring-1 focus-visible:ring-blue-300 focus-visible:ring-offset-0 focus-visible:border-blue-400 shadow-none"
          />
          {q && (
            <Button
              type="button"
              variant="outline"
              className="border-blue-200 bg-transparent"
              onClick={onClear}
              aria-label="Очистить"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            Найти
          </Button>
        </form>

        {loading ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <ChannelCardSkeleton key={`channels-skel-${i}`} />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              {q ? "Каналы не найдены." : "Нет каналов для отображения."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {grouped.map((item) => (
              <ChannelCard key={item.channel.id} channel={item.channel} videos={item.videos} />
            ))}
            {hasNext &&
              Array.from({ length: Math.max(1, pageSize) }).map((_, i) => (
                i === 0 ? (
                  <div key={`channels-tail-sentinel-wrap-${i}`} ref={sentinelRef}>
                    <ChannelCardSkeleton />
                  </div>
                ) : (
                  <ChannelCardSkeleton key={`channels-tail-skel-${i}`} />
                )
              ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
