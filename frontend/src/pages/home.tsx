import { cn } from "@/lib/utils"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useLocation } from "react-router-dom" // заменили на react-router-dom
import { VideoCard } from "@/components/video-card"
import { BottomNav } from "@/components/bottom-nav"
import { videoUseCases } from "@/use-cases/video"
import type { Video } from "@/types/video"

export function HomePage() {
  const [searchParams] = useSearchParams() // в react-router-dom возвращается массив [params, setParams]
  const q = (searchParams.get("q") || "").toLowerCase().trim()
  const [apiVideos, setApiVideos] = useState<Video[]>([])

  const location = useLocation()

  useEffect(() => {
    // Prefer API videos only. If query is present, use server search.
    let mounted = true
    ;(async () => {
      if (location.pathname !== "/" && location.pathname !== "") return
      try {
        const list = q ? await videoUseCases.search(q) : await videoUseCases.fetchList()
        if (mounted) setApiVideos(list)
      } catch (err) {
        console.error("Failed to load videos from API:", err)
        if (mounted) setApiVideos([])
      }
    })()

    return () => {
      mounted = false
    }
  }, [location.pathname, q])

  const allVideos = useMemo<Video[]>(() => {
  // Only use API videos. If API returned nothing, the list will be empty.
  return apiVideos
  }, [apiVideos])

  // Server already filtered when q present
  const filtered = useMemo(() => allVideos, [allVideos])

  // Debug: log what's being rendered
  console.log("HomePage: filtered videos count=", filtered.length)
  if (filtered.length) console.log("HomePage: sample video=", filtered[0])

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-6xl px-3 sm:px-4">
        {q && (
          <div className="py-2 text-sm">
            Результаты по запросу: <span className="font-medium text-blue-700">{q}</span>
            <span className="text-muted-foreground ml-2">({filtered.length} видео)</span>
          </div>
        )}
        <div className={cn("grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", q ? "pt-0" : "pt-2")}>
          {filtered.map((v: Video) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
