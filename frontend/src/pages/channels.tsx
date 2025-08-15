import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { Input } from "@/components/ui/input"
import { videos as builtins } from "@/lib/glebtube-data"
import { type Video, type UploadedVideo } from "@/types/video"
import { getUploads } from "@/lib/glebtube-storage"
import { ChannelCard } from "@/components/channel-card"
import { useSearchParams, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { User } from "@/types/user"

export function ChannelsPage() {
  const [uploads, setUploads] = useState<UploadedVideo[]>([])
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const qParam = (searchParams.get("q") || "").trim()
  const [q, setQ] = useState(qParam)

  useEffect(() => setUploads(getUploads()), [])
  useEffect(() => {
    setQ(qParam)
  }, [qParam])

  const all: Video[] = useMemo(() => [...uploads, ...builtins], [uploads])

  const grouped = useMemo(() => {
    const channelMap = new Map<string, { channel: User; videos: Video[] }>()

    for (const video of all) {
      const channelId = video.channel.id

      if (!channelMap.has(channelId)) {
        channelMap.set(channelId, {
          channel: video.channel,
          videos: [],
        })
      }

      channelMap.get(channelId)!.videos.push(video)
    }

    let channelList = Array.from(channelMap.values())

    // Filter by search query
    if (q) {
      const qc = q.toLowerCase()
      channelList = channelList.filter(
        (item) =>
          item.channel.name.toLowerCase().includes(qc) ||
          item.channel.handle.toLowerCase().includes(qc) ||
          (item.channel.bio && item.channel.bio.toLowerCase().includes(qc)),
      )
    }

    // Sort: by number of videos desc, then by name asc
    channelList.sort((a, b) => {
      const videoCountDiff = b.videos.length - a.videos.length
      if (videoCountDiff !== 0) return videoCountDiff
      return a.channel.name.localeCompare(b.channel.name)
    })

    return channelList
  }, [all, q])

  function onSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const target = q.trim()
    if (target) {
      setSearchParams({ q: target })
    } else {
      navigate(pathname)
    }
  }

  function onClear() {
    setQ("")
    navigate(pathname)
  }

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-5xl px-3 sm:px-4 py-6 grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold">Каналы</h1>
          <div className="text-sm text-muted-foreground">
            {grouped.length} {grouped.length === 1 ? "канал" : grouped.length < 5 ? "канала" : "каналов"}
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

        {grouped.length === 0 ? (
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
            <p className="text-sm text-muted-foreground">{q ? "Каналы не найдены." : "Нет каналов для отображения."}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {grouped.map((item) => (
              <ChannelCard key={item.channel.id} channel={item.channel} videos={item.videos} />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
