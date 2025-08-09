

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { VideoCard } from "@/components/video-card"
import { videos as builtins } from "@/lib/glebtube-data"
import { getUploads, type UploadedVideo } from "@/lib/glebtube-storage"
import { BottomNav } from "@/components/bottom-nav"

export default function HomePage() {
  const params = useSearchParams()
  const q = (params.get("q") || "").toLowerCase().trim()
  const [uploads, setUploads] = useState<UploadedVideo[]>([])

  useEffect(() => {
    setUploads(getUploads())
  }, [])

  const allVideos = useMemo(() => [...uploads, ...builtins], [uploads])

  const filtered = useMemo(() => {
    if (!q) return allVideos
    return allVideos.filter((v) => v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q))
  }, [q, allVideos])

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <Header />
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6">
        {q && (
          <div className="mb-4 text-sm">
            Результаты по запросу: <span className="font-medium text-blue-700">{q}</span>
          </div>
        )}
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground mt-8">Ничего не найдено. Попробуйте другой запрос.</div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
