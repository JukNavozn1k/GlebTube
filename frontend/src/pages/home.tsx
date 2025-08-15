import { cn } from "@/lib/utils"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom" // заменили на react-router-dom
import { VideoCard } from "@/components/video-card"
import { videos as builtins } from "@/data/videos"
import { getUploads } from "@/lib/glebtube-storage"
import type { UploadedVideo } from "@/types/video"
import { BottomNav } from "@/components/bottom-nav"

export function HomePage() {
  const [searchParams] = useSearchParams() // в react-router-dom возвращается массив [params, setParams]
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
        v.channel.name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.tags.some((tag) => tag.toLowerCase().includes(q)),
    )
  }, [q, allVideos])

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
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">{q ? "Ничего не найдено" : "Нет видео"}</h3>
            <p className="text-sm text-muted-foreground">
              {q ? "Попробуйте изменить поисковый запрос." : "Пока что нет видео для отображения."}
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
