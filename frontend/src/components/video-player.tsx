"use client"

import { useRef } from "react"

type VideoPlayerProps = {
  src: string
  poster?: string
  title?: string
  autoPlay?: boolean
  controls?: boolean
  className?: string
}

export function VideoPlayer({
  src,
  poster,
  title = "Видео",
  autoPlay = false,
  controls = true,
  className = "",
}: VideoPlayerProps) {
  const ref = useRef<HTMLVideoElement>(null)

  return (
    <div className={`relative w-full overflow-hidden rounded-lg bg-black ${className}`}>
      <video ref={ref} controls={controls} autoPlay={autoPlay} poster={poster} className="w-full h-full aspect-video">
        <source src={src} type="video/mp4" />
        {"Ваш браузер не поддерживает видео."}
      </video>
      <div className="absolute inset-x-0 top-0 p-3 text-white bg-gradient-to-b from-black/50 to-transparent text-sm sm:text-base">
        <div className="line-clamp-1">{title}</div>
      </div>
    </div>
  )
}
