import React, { useState, useRef, useEffect } from 'react'
import { VideoEditorUseCases, type TimelineClip } from '@/use-cases/video-editor'
import { 
  Play, 
  Pause, 
  Upload,  
  Scissors, 
  RotateCw, 
  Volume2, 
  VolumeX,
  Loader2,
  ZoomIn,
  ZoomOut,
  Palette,
  Home,
  Undo,
  Redo,
  Save,
  Sparkles,
  Type,
  Music,
  Split,
  SkipBack,
  SkipForward
} from 'lucide-react'

interface VideoEditorState {
  videoFile: File | null
  videoUrl: string
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  trimStart: number
  trimEnd: number
  isProcessing: boolean
  processedVideoUrl: string
  timelineClips: TimelineClip[]
  timelineScale: number
  selectedEffect: string
  effectParams: Record<string, any>
  activePanel: 'effects' | 'audio' | 'text' | null
  isMobile: boolean
}

export function VideoEditorPage() {
  const [state, setState] = useState<VideoEditorState>({
    videoFile: null,
    videoUrl: '',
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    trimStart: 0,
    trimEnd: 0,
    isProcessing: false,
    processedVideoUrl: '',
    timelineClips: [],
    timelineScale: 1,
    selectedEffect: 'brightness',
    effectParams: { value: 0.1 },
    activePanel: null,
    isMobile: false
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoEditor = useRef(new VideoEditorUseCases())

  useEffect(() => {
    const checkMobile = () => {
      setState(prev => ({ ...prev, isMobile: window.innerWidth < 768 }))
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const initializeEditor = async () => {
      try {
        await videoEditor.current.initialize()
      } catch (error) {
        console.error('Failed to initialize video editor:', error)
      }
    }
    initializeEditor()
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file)
      setState(prev => ({
        ...prev,
        videoFile: file,
        videoUrl: url,
        processedVideoUrl: ''
      }))
    }
  }

  const handleVideoLoad = () => {
    if (videoRef.current && state.videoFile) {
      const duration = videoRef.current.duration
      const clip = videoEditor.current.createTimelineClip(
        state.videoFile,
        0,
        duration,
        state.timelineScale
      )
      setState(prev => ({
        ...prev,
        duration,
        trimEnd: duration,
        timelineClips: [clip]
      }))
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setState(prev => ({
        ...prev,
        currentTime: videoRef.current!.currentTime
      }))
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
    }
  }

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setState(prev => ({ ...prev, currentTime: time }))
    }
  }

  const handleVolumeChange = (volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = volume
      setState(prev => ({ ...prev, volume }))
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !state.isMuted
      setState(prev => ({ ...prev, isMuted: !prev.isMuted }))
    }
  }

  const processVideo = async () => {
    if (!state.videoFile) return

    setState(prev => ({ ...prev, isProcessing: true }))

    try {
      await videoEditor.current.initialize()
      
      const blob = await videoEditor.current.trimVideo(
        state.videoFile,
        state.trimStart,
        state.trimEnd
      )
      const url = URL.createObjectURL(blob)

      setState(prev => ({
        ...prev,
        processedVideoUrl: url,
        isProcessing: false
      }))
    } catch (error) {
      console.error('Video processing failed:', error)
      alert('Ошибка обработки видео: ' + (error as Error).message)
      setState(prev => ({ ...prev, isProcessing: false }))
    }
  }

  const applyEffect = async () => {
    if (!state.videoFile) return

    setState(prev => ({ ...prev, isProcessing: true }))

    try {
      await videoEditor.current.initialize()
      
      let blob: Blob
      
      if (state.selectedEffect === 'rotate') {
        blob = await videoEditor.current.applyRotation(state.videoFile, 90)
      } else {
        blob = await videoEditor.current.applyFilter(
          state.videoFile,
          state.selectedEffect,
          state.effectParams
        )
      }
      
      const url = URL.createObjectURL(blob)
      setState(prev => ({
        ...prev,
        processedVideoUrl: url,
        isProcessing: false
      }))
    } catch (error) {
      console.error('Effect application failed:', error)
      alert('Ошибка применения эффекта: ' + (error as Error).message)
      setState(prev => ({ ...prev, isProcessing: false }))
    }
  }

  const downloadVideo = () => {
    if (state.processedVideoUrl) {
      const a = document.createElement('a')
      a.href = state.processedVideoUrl
      a.download = 'edited-video.mp4'
      a.click()
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const TimelineComponent = () => (
    <div className="bg-gray-800 border-t border-gray-700">
      {/* Timeline Controls */}
      <div className="h-10 bg-gray-750 border-b border-gray-600 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSeek(Math.max(0, state.currentTime - 10))}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlayPause}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
          >
            {state.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleSeek(Math.min(state.duration, state.currentTime + 10))}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-600 mx-2" />
          <span className="text-sm text-gray-300 font-mono">
            {formatTime(state.currentTime)} / {formatTime(state.duration)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <ZoomOut className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={state.timelineScale}
            onChange={(e) => setState(prev => ({ ...prev, timelineScale: parseFloat(e.target.value) }))}
            className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <ZoomIn className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Timeline Track */}
      <div className="h-32 bg-gray-800 relative overflow-x-auto">
        {/* Time ruler */}
        <div className="h-6 bg-gray-750 border-b border-gray-600 relative">
          {Array.from({ length: Math.ceil(state.duration) + 1 }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full flex items-center text-xs text-gray-400"
              style={{ left: i * 50 * state.timelineScale }}
            >
              <div className="w-px h-4 bg-gray-500 mr-2" />
              {formatTime(i)}
            </div>
          ))}
        </div>

        {/* Video track */}
        <div className="h-20 bg-gray-800 relative border-b border-gray-600">
          {state.timelineClips.map((clip) => (
            <div
              key={clip.id}
              className="absolute top-2 h-16 bg-blue-600 rounded border border-blue-500 cursor-move group"
              style={{
                left: clip.x,
                width: clip.width,
              }}
            >
              <div className="p-2 text-white text-xs">
                <div className="font-medium truncate">Video</div>
                <div className="text-blue-200 text-xs">
                  {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                </div>
              </div>
            </div>
          ))}
          
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
            style={{ left: state.currentTime * 50 * state.timelineScale }}
          >
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full" />
          </div>
        </div>

        {/* Audio track placeholder */}
        <div className="h-6 bg-gray-750 border-b border-gray-600 flex items-center px-2">
          <Music className="w-3 h-3 text-gray-500 mr-2" />
          <span className="text-xs text-gray-500">Аудио дорожка</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            {!state.isMobile && <span>Главная</span>}
          </button>
          <div className="w-px h-6 bg-gray-600" />
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
            <Redo className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">GlebTube Editor</span>
          {state.isProcessing && (
            <div className="flex items-center gap-2 text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Обработка...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={downloadVideo}
            disabled={!state.processedVideoUrl}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            {!state.isMobile && <span>Экспорт</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Tools */}
        <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 gap-2">
          <button
            onClick={() => setState(prev => ({ ...prev, activePanel: prev.activePanel === 'effects' ? null : 'effects' }))}
            className={`p-3 rounded-lg transition-colors ${
              state.activePanel === 'effects' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, activePanel: prev.activePanel === 'audio' ? null : 'audio' }))}
            className={`p-3 rounded-lg transition-colors ${
              state.activePanel === 'audio' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Music className="w-5 h-5" />
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, activePanel: prev.activePanel === 'text' ? null : 'text' }))}
            className={`p-3 rounded-lg transition-colors ${
              state.activePanel === 'text' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Type className="w-5 h-5" />
          </button>
          <div className="w-8 h-px bg-gray-600 my-2" />
          <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
            <Split className="w-5 h-5" />
          </button>
          <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
            <Scissors className="w-5 h-5" />
          </button>
        </div>

        {/* Center - Video Preview */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black flex items-center justify-center relative">
            {!state.videoUrl ? (
              <div 
                className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-gray-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <p className="text-xl font-medium mb-2 text-gray-300">Загрузите видео</p>
                <p className="text-sm text-gray-500">Поддерживаются форматы: MP4, AVI, MOV, WebM</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={state.processedVideoUrl || state.videoUrl}
                  className="max-w-full max-h-full"
                  onLoadedMetadata={handleVideoLoad}
                  onTimeUpdate={handleTimeUpdate}
                  controls={false}
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlayPause}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      {state.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max={state.duration}
                        value={state.currentTime}
                        onChange={(e) => handleSeek(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <button
                      onClick={toggleMute}
                      className="p-2 text-white hover:bg-white/20 rounded"
                    >
                      {state.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={state.volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Timeline */}
          {state.videoUrl && <TimelineComponent />}
        </div>

        {/* Right Sidebar - Properties Panel */}
        {state.activePanel && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
            {state.activePanel === 'effects' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Эффекты</h3>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium">Выберите эффект:</label>
                  <select 
                    value={state.selectedEffect}
                    onChange={(e) => setState(prev => ({ ...prev, selectedEffect: e.target.value }))}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="brightness">Яркость</option>
                    <option value="contrast">Контрастность</option>
                    <option value="saturation">Насыщенность</option>
                    <option value="blur">Размытие</option>
                    <option value="grayscale">Черно-белый</option>
                    <option value="sepia">Сепия</option>
                  </select>
                </div>

                {state.selectedEffect !== 'grayscale' && state.selectedEffect !== 'sepia' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Интенсивность: {state.effectParams.value}
                    </label>
                    <input
                      type="range"
                      min={state.selectedEffect === 'blur' ? 1 : 0.1}
                      max={state.selectedEffect === 'blur' ? 10 : 2}
                      step="0.1"
                      value={state.effectParams.value}
                      onChange={(e) => setState(prev => ({ 
                        ...prev, 
                        effectParams: { ...prev.effectParams, value: parseFloat(e.target.value) }
                      }))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}

                <button
                  onClick={applyEffect}
                  disabled={!state.videoUrl || state.isProcessing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                >
                  {state.isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Применение...
                    </>
                  ) : (
                    <>
                      <Palette className="w-4 h-4" />
                      Применить эффект
                    </>
                  )}
                </button>

                <button
                  onClick={async () => {
                    if (state.videoFile) {
                      setState(prev => ({ ...prev, isProcessing: true }))
                      try {
                        await videoEditor.current.initialize()
                        const blob = await videoEditor.current.applyRotation(state.videoFile, 90)
                        const url = URL.createObjectURL(blob)
                        setState(prev => ({ ...prev, processedVideoUrl: url, isProcessing: false }))
                      } catch (error) {
                        console.error('Rotation failed:', error)
                        setState(prev => ({ ...prev, isProcessing: false }))
                      }
                    }
                  }}
                  disabled={!state.videoUrl || state.isProcessing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                  Повернуть на 90°
                </button>

                <div className="border-t border-gray-600 pt-4">
                  <h4 className="text-sm font-medium mb-3">Обрезка видео</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">
                        Начало: {formatTime(state.trimStart)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max={state.duration}
                        step="0.1"
                        value={state.trimStart}
                        onChange={(e) => setState(prev => ({ ...prev, trimStart: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">
                        Конец: {formatTime(state.trimEnd)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max={state.duration}
                        step="0.1"
                        value={state.trimEnd}
                        onChange={(e) => setState(prev => ({ ...prev, trimEnd: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <button
                      onClick={processVideo}
                      disabled={!state.videoUrl || state.isProcessing}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                    >
                      {state.isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Обработка...
                        </>
                      ) : (
                        <>
                          <Scissors className="w-4 h-4" />
                          Обрезать видео
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {state.activePanel === 'audio' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Аудио</h3>
                <p className="text-gray-400 text-sm">Аудио инструменты будут добавлены в следующих версиях</p>
              </div>
            )}

            {state.activePanel === 'text' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Текст</h3>
                <p className="text-gray-400 text-sm">Инструменты для добавления текста будут добавлены в следующих версиях</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
