import React, { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { type TimelineClip } from '@/use-cases/video-editor'

interface TimelineProps {
  clips: TimelineClip[]
  duration: number
  currentTime: number
  scale: number
  onClipMove: (clipId: string, newX: number) => void
  onClipResize: (clipId: string, newWidth: number, resizeEnd: boolean) => void
  onTimeSeek: (time: number) => void
  className?: string
}

interface DragState {
  isDragging: boolean
  dragType: 'move' | 'resize-start' | 'resize-end'
  clipId: string
  startX: number
  startValue: number
}

export function Timeline({ 
  clips, 
  duration, 
  currentTime, 
  scale, 
  onClipMove, 
  onClipResize, 
  onTimeSeek,
  className 
}: TimelineProps) {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const pixelsPerSecond = 50

  const timeToPixels = (time: number) => time * pixelsPerSecond * scale
  const pixelsToTime = (pixels: number) => pixels / (pixelsPerSecond * scale)

  const handleMouseDown = useCallback((e: React.MouseEvent, clipId: string, dragType: DragState['dragType']) => {
    e.preventDefault()
    e.stopPropagation()
    
    const clip = clips.find(c => c.id === clipId)
    if (!clip) return

    const startValue = dragType === 'move' ? clip.x : clip.width
    
    setDragState({
      isDragging: true,
      dragType,
      clipId,
      startX: e.clientX,
      startValue
    })
  }, [clips])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState) return

    const deltaX = e.clientX - dragState.startX
    const newValue = Math.max(0, dragState.startValue + deltaX)

    if (dragState.dragType === 'move') {
      onClipMove(dragState.clipId, newValue)
    } else {
      const resizeEnd = dragState.dragType === 'resize-end'
      onClipResize(dragState.clipId, newValue, resizeEnd)
    }
  }, [dragState, onClipMove, onClipResize])

  const handleMouseUp = useCallback(() => {
    setDragState(null)
  }, [])

  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (dragState) return
    
    const rect = timelineRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const time = pixelsToTime(x)
    onTimeSeek(Math.max(0, Math.min(duration, time)))
  }, [dragState, duration, onTimeSeek, pixelsToTime])

  useEffect(() => {
    if (dragState) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragState, handleMouseMove, handleMouseUp])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const frames = Math.floor((time % 1) * 30)
    return `${minutes}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
  }

  const timelineWidth = timeToPixels(duration)
  const playheadPosition = timeToPixels(currentTime)

  return (
    <div className={cn("relative bg-gray-900 rounded-lg overflow-hidden", className)}>
      {/* Time ruler */}
      <div className="h-8 bg-gray-800 border-b border-gray-700 relative">
        {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full flex items-center text-xs text-gray-400"
            style={{ left: timeToPixels(i) }}
          >
            <div className="w-px h-4 bg-gray-600 mr-2" />
            {formatTime(i)}
          </div>
        ))}
      </div>

      {/* Timeline tracks */}
      <div 
        ref={timelineRef}
        className="relative h-24 bg-gray-900 cursor-pointer select-none"
        onClick={handleTimelineClick}
        style={{ width: Math.max(timelineWidth, 800) }}
      >
        {/* Grid lines */}
        {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-gray-700 opacity-50"
            style={{ left: timeToPixels(i) }}
          />
        ))}

        {/* Clips */}
        {clips.map((clip) => (
          <div
            key={clip.id}
            className="absolute top-2 h-20 bg-blue-600 rounded border-2 border-blue-500 cursor-move group"
            style={{
              left: clip.x,
              width: clip.width,
            }}
            onMouseDown={(e) => handleMouseDown(e, clip.id, 'move')}
          >
            {/* Clip content */}
            <div className="p-2 text-white text-xs truncate">
              <div className="font-medium">Video Clip</div>
              <div className="text-blue-200">
                {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
              </div>
            </div>

            {/* Resize handles */}
            <div
              className="absolute left-0 top-0 bottom-0 w-2 bg-blue-400 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleMouseDown(e, clip.id, 'resize-start')}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-2 bg-blue-400 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleMouseDown(e, clip.id, 'resize-end')}
            />

            {/* Effects indicator */}
            {clip.effects.length > 0 && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" />
            )}
          </div>
        ))}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
          style={{ left: playheadPosition }}
        >
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rotate-45 transform origin-center" />
        </div>
      </div>

      {/* Timeline controls */}
      <div className="h-8 bg-gray-800 border-t border-gray-700 flex items-center px-4 gap-4">
        <div className="text-xs text-gray-400">
          Масштаб: {Math.round(scale * 100)}%
        </div>
        <div className="text-xs text-gray-400">
          Время: {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className="text-xs text-gray-400">
          Клипов: {clips.length}
        </div>
      </div>
    </div>
  )
}
