import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { BottomNav } from "@/components/bottom-nav"
import { Input } from "@/components/ui/input"
import { videos as builtins, type Video } from "@/lib/glebtube-data"
import { getUploads, type UploadedVideo } from "@/lib/glebtube-storage"
import { ChannelCard } from "@/components/channel-card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useProtectedRoute } from "@/hooks/use-protected-route"
export function ChannelsPage() {
  const [uploads, setUploads] = useState<UploadedVideo[]>([])
  const isAuthorized = useProtectedRoute("/upload")
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const qParam = (searchParams.get("q") || "").trim()
  const [q, setQ] = useState(qParam)

  useEffect(() => setUploads(getUploads()), [])
  useEffect(() => {
    setQ(qParam)
  }, [qParam])

  const all: Video[] = useMemo(() => [...uploads, ...builtins], [uploads])

  const grouped = useMemo(() => {
    const m = new Map<string, Video[]>()
    for (const v of all) {
      if (!m.has(v.channel)) m.set(v.channel, [])
      m.get(v.channel)!.push(v)
    }
    let list = Array.from(m.entries()).map(([channel, videos]) => ({ channel, videos }))
    if (q) {
      const qc = q.toLowerCase()
      list = list.filter((c) => c.channel.toLowerCase().includes(qc))
    }
    list.sort((a, b) => b.videos.length - a.videos.length || a.channel.localeCompare(b.channel))
    return list
  }, [all, q])

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

  
  if (!isAuthorized) {
    return null
  }
  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-5xl px-3 sm:px-4 py-6 grid gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold">Каналы</h1>

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
          <div className="text-sm text-muted-foreground">Каналы не найдены.</div>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {grouped.map((c) => (
              <ChannelCard key={c.channel} channel={c.channel} videos={c.videos} />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
