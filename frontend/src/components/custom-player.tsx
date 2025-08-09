"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX, PictureInPicture2, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type CustomPlayerProps = {
  src: string
  poster?: string
  title?: string
  className?: string
  autoPlay?: boolean
}

export function CustomPlayer({ src, poster, title = "Видео", className = "", autoPlay = false }: CustomPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [fs, setFs] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [useNative, setUseNative] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  const [isScrubbing, setIsScrubbing] = useState(false)
  const [hoverX, setHoverX] = useState<number | null>(null)
  const [hoverTime, setHoverTime] = useState<number | null>(null)

  const fmt = useCallback((t: number) => {
    if (!Number.isFinite(t)) return "0:00"
    const s = Math.floor(t % 60)
    const m = Math.floor((t / 60) % 60)
    const h = Math.floor(t / 3600)
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    return `${m}:${s.toString().padStart(2, "0")}`
  }, [])

  const VolIcon = useMemo(() => (muted || volume === 0 ? VolumeX : Volume2), [muted, volume])

  const computeBuffered = (v: HTMLVideoElement) => {
    try {
      const ranges = v.buffered
      if (!ranges || ranges.length === 0 || !Number.isFinite(v.duration) || v.duration <= 0) return 0
      return Math.max(0, Math.min(1, ranges.end(ranges.length - 1) / v.duration))
    } catch {
      return 0
    }
  }

  const getPercentFromClientX = (clientX: number) => {
    const el = progressRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const x = Math.max(rect.left, Math.min(clientX, rect.right))
    return (x - rect.left) / rect.width
  }

  const seekToPercent = (percent: number) => {
    const v = videoRef.current
    if (!v || !Number.isFinite(v.duration)) return
    const t = Math.max(0, Math.min(1, percent)) * v.duration
    v.currentTime = t
    setCurrent(t)
  }

  const updateHover = (clientX: number | null) => {
    if (clientX === null) {
      setHoverX(null)
      setHoverTime(null)
      return
    }
    const el = progressRef.current
    const v = videoRef.current
    if (!el || !v || !Number.isFinite(v.duration)) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(rect.left, Math.min(clientX, rect.right))
    const p = (x - rect.left) / rect.width
    setHoverX(x - rect.left)
    setHoverTime(p * v.duration)
  }

  const onTogglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }, [])

  const onToggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
  }, [])

  const onChangeVolume = (val: number) => {
    const v = videoRef.current
    if (!v) return
    v.volume = Math.max(0, Math.min(1, val))
    if (v.volume > 0 && v.muted) v.muted = false
    setVolume(v.volume ?? 1)
    setMuted(v.muted)
  }

  const onToggleFs = async () => {
    const el = wrapRef.current
    if (!el) return
    try {
      if (!document.fullscreenElement) await el.requestFullscreen()
      else await document.exitFullscreen()
    } catch {}
  }

  const onTogglePiP = async () => {
    const v = videoRef.current as any
    if (!v) return
    try {
      if (document.pictureInPictureElement) await (document as any).exitPictureInPicture?.()
      else await v.requestPictureInPicture?.()
    } catch {}
  }

  // Wire video events
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onLoaded = () => {
      setDuration(Number.isFinite(v.duration) ? v.duration : 0)
      setReady(true)
      setPlaying(!v.paused)
      setMuted(v.muted)
      setVolume(v.volume ?? 1)
      setBuffered(computeBuffered(v))
      v.playbackRate = playbackRate
    }
    const onTime = () => setCurrent(v.currentTime)
    const onProgress = () => setBuffered(computeBuffered(v))
    const onPlay = () => {
      setPlaying(true)
      setIsLoading(false)
    }
    const onPause = () => setPlaying(false)
    const onWaiting = () => setIsLoading(true)
    const onPlaying = () => setIsLoading(false)
    const onStalled = () => setIsLoading(true)
    const onVolume = () => {
      setMuted(v.muted)
      setVolume(v.volume ?? 1)
    }
    const onError = () => setUseNative(true)

    v.addEventListener("loadedmetadata", onLoaded)
    v.addEventListener("timeupdate", onTime)
    v.addEventListener("progress", onProgress)
    v.addEventListener("play", onPlay)
    v.addEventListener("pause", onPause)
    v.addEventListener("waiting", onWaiting)
    v.addEventListener("playing", onPlaying)
    v.addEventListener("stalled", onStalled)
    v.addEventListener("volumechange", onVolume)
    v.addEventListener("error", onError)

    if (autoPlay) v.play().catch(() => {})

    return () => {
      v.removeEventListener("loadedmetadata", onLoaded)
      v.removeEventListener("timeupdate", onTime)
      v.removeEventListener("progress", onProgress)
      v.removeEventListener("play", onPlay)
      v.removeEventListener("pause", onPause)
      v.removeEventListener("waiting", onWaiting)
      v.removeEventListener("playing", onPlaying)
      v.removeEventListener("stalled", onStalled)
      v.removeEventListener("volumechange", onVolume)
      v.removeEventListener("error", onError)
    }
  }, [autoPlay, playbackRate])

  // Fullscreen state
  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onFs)
    return () => document.removeEventListener("fullscreenchange", onFs)
  }, [])

  // Auto-hide while playing
  useEffect(() => {
    if (!playing) {
      setControlsVisible(true)
      return
    }
    let t: number | undefined
    const show = () => {
      setControlsVisible(true)
      window.clearTimeout(t)
      t = window.setTimeout(() => setControlsVisible(false), 2200)
    }
    const w = wrapRef.current
    if (!w) return
    w.addEventListener("mousemove", show)
    w.addEventListener("touchstart", show, { passive: true })
    show()
    return () => {
      w.removeEventListener("mousemove", show)
      w.removeEventListener("touchstart", show)
      window.clearTimeout(t)
    }
  }, [playing])

  // Keyboard shortcuts on hover
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = wrapRef.current
      if (!el || !el.matches(":hover")) return
      if (e.code === "Space" || e.key.toLowerCase() === "k") {
        e.preventDefault()
        onTogglePlay()
      } else if (e.key.toLowerCase() === "m") onToggleMute()
      else if (e.key.toLowerCase() === "f") onToggleFs()
      else if (e.key === "ArrowLeft") seekToPercent((current - 5) / Math.max(1, duration))
      else if (e.key === "ArrowRight") seekToPercent((current + 5) / Math.max(1, duration))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [current, duration, onTogglePlay])

  // Scrubbing
  useEffect(() => {
    const move = (e: MouseEvent) => isScrubbing && seekToPercent(getPercentFromClientX(e.clientX))
    const moveTouch = (e: TouchEvent) => isScrubbing && seekToPercent(getPercentFromClientX(e.touches[0]?.clientX ?? 0))
    const up = () => setIsScrubbing(false)
    if (isScrubbing) {
      window.addEventListener("mousemove", move)
      window.addEventListener("touchmove", moveTouch, { passive: true })
      window.addEventListener("mouseup", up, { once: true })
      window.addEventListener("touchend", up, { once: true })
    }
    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("touchmove", moveTouch)
    }
  }, [isScrubbing])

  // Hover tooltip events
  useEffect(() => {
    const el = progressRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => updateHover(e.clientX)
    const onLeave = () => updateHover(null)
    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
    return () => {
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
    }
  }, [duration])

  // Apply playback rate
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackRate
  }, [playbackRate])

  if (useNative) {
    return (
      <div className={cn("relative w-full rounded-lg overflow-hidden bg-black", className)}>
        <video
          src={src}
          poster={poster}
          className="w-full h-full aspect-video"
          controls
          playsInline
          preload="metadata"
        />
      </div>
    )
  }

  const played = duration > 0 ? (current / duration) * 100 : 0
  const buff = buffered * 100

  const btn =
    "grid place-items-center rounded-md ring-1 ring-white/20 bg-white/5 hover:bg-white/15 active:bg-white/25 transition-colors h-8 w-8 p-1.5 md:h-9 md:w-9 md:p-2"

  return (
    <div
      ref={wrapRef}
      className={cn("relative w-full rounded-lg overflow-hidden bg-black select-none", className)}
      onDoubleClick={onToggleFs}
    >
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full aspect-video"
        playsInline
        controls={false}
        preload="metadata"
        onClick={onTogglePlay}
      >
        <source src={src} />
        {"Ваш браузер не поддерживает видео."}
      </video>

      {(isLoading || (!ready && !useNative)) && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-7 w-7 rounded-full border border-white/25 border-t-white animate-spin" />
        </div>
      )}

      {/* Title bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 p-2 text-white bg-gradient-to-b from-black/35 to-transparent text-[12px] sm:text-[13px]">
        <div className="line-clamp-1">{title}</div>
      </div>

      {/* Controls */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 px-2 pb-2 pt-1 bg-gradient-to-t from-black/65 to-transparent transition-opacity",
          controlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Progress (medium) */}
        <div
          ref={progressRef}
          className="relative h-[6px] cursor-pointer group"
          onMouseDown={(e) => {
            setIsScrubbing(true)
            seekToPercent(getPercentFromClientX(e.clientX))
          }}
          onTouchStart={(e) => {
            setIsScrubbing(true)
            seekToPercent(getPercentFromClientX(e.touches[0]?.clientX ?? 0))
          }}
        >
          <div className="absolute inset-0 rounded-full bg-white/15" />
          <div className="absolute inset-y-0 left-0 rounded-full bg-white/30" style={{ width: `${buff}%` }} />
          <div className="absolute inset-y-0 left-0 rounded-full bg-blue-600" style={{ width: `${played}%` }} />
          {/* thumb (smaller) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-white outline outline-1 outline-blue-600 transition-opacity opacity-0 group-hover:opacity-100"
            style={{ left: `calc(${played}% - 5px)` }}
          />
          {/* hover time */}
          {hoverX !== null && hoverTime !== null && (
            <div
              className="absolute -top-6 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px]"
              style={{ left: hoverX }}
            >
              {fmt(hoverTime)}
            </div>
          )}
        </div>

        {/* Buttons row (new design) */}
        <div className="mt-1.5 flex items-center gap-1.5 text-white group">
          <button aria-label={playing ? "Пауза" : "Воспроизвести"} onClick={onTogglePlay} className={btn}>
            {playing ? <Pause className="h-4 w-4 md:h-5 md:w-5" /> : <Play className="h-4 w-4 md:h-5 md:w-5" />}
          </button>

          <button aria-label={muted ? "Включить звук" : "Выключить звук"} onClick={onToggleMute} className={btn}>
            <VolIcon className="h-4 w-4 md:h-5 md:w-5" />
          </button>

          {/* Thin volume slider; shows on hover (desktop) */}
          <input
            aria-label="Громкость"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => onChangeVolume(Number(e.target.value))}
            className="player-range w-24 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"
          />

          <div className="ml-2 text-[11px] tabular-nums opacity-90">
            {fmt(current)} / {fmt(duration)}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Settings (speed) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={btn} aria-label="Настройки">
                  <Settings className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuLabel>Скорость</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                  <DropdownMenuItem key={r} onClick={() => setPlaybackRate(r)}>
                    {r}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button aria-label="Картинка в картинке" onClick={onTogglePiP} className={btn}>
              <PictureInPicture2 className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            <button
              aria-label={fs ? "Выйти из полноэкранного режима" : "На весь экран"}
              onClick={onToggleFs}
              className={btn}
            >
              {fs ? <Minimize className="h-4 w-4 md:h-5 md:w-5" /> : <Maximize className="h-4 w-4 md:h-5 md:w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Range styling (thin track + small thumb) */}
      <style jsx>{`
        .player-range {
          appearance: none;
          -webkit-appearance: none;
          background: transparent;
          outline: none;
          height: 16px; /* clickable area; visual track is handled in pseudo elements */
        }
        /* WebKit */
        .player-range::-webkit-slider-runnable-track {
          height: 2px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 9999px;
        }
        .player-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 10px;
          width: 10px;
          margin-top: -4px; /* centers thumb over 2px track */
          background: #ffffff;
          border-radius: 9999px;
          border: 1px solid rgba(59, 130, 246, 1); /* blue-600 */
        }
        /* Firefox */
        .player-range::-moz-range-track {
          height: 2px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 9999px;
        }
        .player-range::-moz-range-thumb {
          height: 10px;
          width: 10px;
          background: #ffffff;
          border-radius: 9999px;
          border: 1px solid rgba(59, 130, 246, 1);
        }
      `}</style>
    </div>
  )
}
