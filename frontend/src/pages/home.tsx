import { cn } from "@/lib/utils"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useLocation } from "react-router-dom" // заменили на react-router-dom
import { VideoCard } from "@/components/video-card"
import { getUploads } from "@/lib/glebtube-storage"
import type { UploadedVideo } from "@/types/video"
import { BottomNav } from "@/components/bottom-nav"
import { VideoUseCase } from "@/use-cases/video-use-case"
import type { Video } from "@/types/video"

export function HomePage() {
  const [searchParams] = useSearchParams() // в react-router-dom возвращается массив [params, setParams]
  const q = (searchParams.get("q") || "").toLowerCase().trim()
  const [uploads, setUploads] = useState<UploadedVideo[]>([])
  const [apiVideos, setApiVideos] = useState<Video[]>([])
  const videoUseCase = useMemo(() => new VideoUseCase(), [])

  const location = useLocation()

  useEffect(() => {
    setUploads(getUploads())

    let mounted = true
    ;(async () => {
      // fetch when user lands on the home route (and also on every navigation to it)
      if (location.pathname === "/" || location.pathname === "") {
        console.log("HomePage: fetching videos from API...")
        try {
          const list = await videoUseCase.fetchList()
          console.log("HomePage: fetched videos count=", Array.isArray(list) ? list.length : typeof list)
          if (mounted) setApiVideos(list)
        } catch (err) {
          // keep uploads as fallback
          console.error("Failed to load videos from API:", err)
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [videoUseCase, location.pathname])

  const allVideos = useMemo(() => {
    // If API returned videos, prefer them and merge local uploads by id.
    if (apiVideos.length) {
      const map = new Map<string, Video>()
      apiVideos.forEach((v) => map.set(v.id, v))
      uploads.forEach((u) => map.set(u.id, u as unknown as Video))
      return Array.from(map.values())
    }

    // If API returned nothing, show uploads only (no builtins/stubs).
    return uploads
  }, [apiVideos, uploads])

  const filtered = useMemo(() => {
    if (!q) return allVideos
    return allVideos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.channel.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.tags.some((tag) => tag.toLowerCase().includes(q)),
    )
  }, [q, allVideos])

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
          {filtered.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
