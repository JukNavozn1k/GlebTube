import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom" // из react-router-dom
import { VideoCard } from "@/components/video-card"
import { videos as builtins } from "@/data/videos"
import { getUploads, type UploadedVideo } from "@/lib/glebtube-storage"
import { BottomNav } from "@/components/bottom-nav"

export function HomePage() {
  const [searchParams] = useSearchParams()
  const q = (searchParams.get("q") || "").toLowerCase().trim()

  const [uploads, setUploads] = useState<UploadedVideo[]>([])

  useEffect(() => {
    setUploads(getUploads())
  }, [])

  const allVideos = useMemo(() => [...uploads, ...builtins], [uploads])

  const filtered = useMemo(() => {
    if (!q) return allVideos
    return allVideos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.channel.toLowerCase().includes(q)
    )
  }, [q, allVideos])

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-6xl px-3 sm:px-4">
        {q && (
          <div className="py-2 text-sm">
            Результаты по запросу:{" "}
            <span className="font-medium text-blue-700">{q}</span>
          </div>
        )}
        <div
          className={cn(
            "grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            q ? "pt-0" : "pt-2"
          )}
        >
          {filtered.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground mt-8">
            Ничего не найдено. Попробуйте другой запрос.
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
