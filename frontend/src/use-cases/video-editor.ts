import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export interface VideoEffect {
  id: string
  name: string
  type: 'filter' | 'transform' | 'audio'
  params: Record<string, any>
}

export interface TimelineClip {
  id: string
  startTime: number
  endTime: number
  duration: number
  x: number
  width: number
  file?: File
  effects: VideoEffect[]
}

export class VideoEditorUseCases {
  private ffmpeg: FFmpeg
  private loaded = false

  constructor() {
    this.ffmpeg = new FFmpeg()
  }

  async initialize() {
    if (this.loaded) return

    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      this.loaded = true
    } catch (error) {
      console.error('Failed to load FFmpeg:', error)
      throw error
    }
  }

  async trimVideo(file: File, startTime: number, endTime: number): Promise<Blob> {
    await this.initialize()
    
    const inputName = 'input.mp4'
    const outputName = 'output.mp4'
    
    try {
      // Write input file
      await this.ffmpeg.writeFile(inputName, await fetchFile(file))
      
      // Calculate duration
      const duration = endTime - startTime
      
      // Execute trim command
      await this.ffmpeg.exec([
        '-i', inputName,
        '-ss', startTime.toString(),
        '-t', duration.toString(),
        '-c', 'copy',
        '-avoid_negative_ts', 'make_zero',
        outputName
      ])
      
      // Read output
      const data = await this.ffmpeg.readFile(outputName)
      
      // Clean up
      await this.ffmpeg.deleteFile(inputName)
      await this.ffmpeg.deleteFile(outputName)
      
      return new Blob([data], { type: 'video/mp4' })
    } catch (error) {
      console.error('Trim failed:', error)
      throw error
    }
  }

  async applyRotation(file: File, degrees: number): Promise<Blob> {
    await this.initialize()
    
    const inputName = 'input.mp4'
    const outputName = 'output.mp4'
    
    try {
      await this.ffmpeg.writeFile(inputName, await fetchFile(file))
      
      let transposeFilter = ''
      switch (degrees) {
        case 90:
          transposeFilter = 'transpose=1'
          break
        case 180:
          transposeFilter = 'transpose=2,transpose=2'
          break
        case 270:
          transposeFilter = 'transpose=2'
          break
        default:
          throw new Error('Unsupported rotation angle')
      }
      
      await this.ffmpeg.exec([
        '-i', inputName,
        '-vf', transposeFilter,
        '-c:a', 'copy',
        outputName
      ])
      
      const data = await this.ffmpeg.readFile(outputName)
      
      await this.ffmpeg.deleteFile(inputName)
      await this.ffmpeg.deleteFile(outputName)
      
      return new Blob([data], { type: 'video/mp4' })
    } catch (error) {
      console.error('Rotation failed:', error)
      throw error
    }
  }

  async applyFilter(file: File, filterName: string, params: Record<string, any> = {}): Promise<Blob> {
    await this.initialize()
    
    const inputName = 'input.mp4'
    const outputName = 'output.mp4'
    
    try {
      await this.ffmpeg.writeFile(inputName, await fetchFile(file))
      
      let filterString = ''
      switch (filterName) {
        case 'brightness':
          filterString = `eq=brightness=${params.value || 0.1}`
          break
        case 'contrast':
          filterString = `eq=contrast=${params.value || 1.2}`
          break
        case 'saturation':
          filterString = `eq=saturation=${params.value || 1.5}`
          break
        case 'blur':
          filterString = `boxblur=${params.value || 2}:${params.value || 2}`
          break
        case 'grayscale':
          filterString = 'colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3'
          break
        case 'sepia':
          filterString = 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131'
          break
        default:
          throw new Error('Unsupported filter')
      }
      
      await this.ffmpeg.exec([
        '-i', inputName,
        '-vf', filterString,
        '-c:a', 'copy',
        outputName
      ])
      
      const data = await this.ffmpeg.readFile(outputName)
      
      await this.ffmpeg.deleteFile(inputName)
      await this.ffmpeg.deleteFile(outputName)
      
      return new Blob([data], { type: 'video/mp4' })
    } catch (error) {
      console.error('Filter failed:', error)
      throw error
    }
  }

  async adjustVolume(file: File, volume: number): Promise<Blob> {
    await this.initialize()
    
    const inputName = 'input.mp4'
    const outputName = 'output.mp4'
    
    try {
      await this.ffmpeg.writeFile(inputName, await fetchFile(file))
      
      await this.ffmpeg.exec([
        '-i', inputName,
        '-af', `volume=${volume}`,
        '-c:v', 'copy',
        outputName
      ])
      
      const data = await this.ffmpeg.readFile(outputName)
      
      await this.ffmpeg.deleteFile(inputName)
      await this.ffmpeg.deleteFile(outputName)
      
      return new Blob([data], { type: 'video/mp4' })
    } catch (error) {
      console.error('Volume adjustment failed:', error)
      throw error
    }
  }

  // Timeline utilities
  timeToPixels(time: number, scale: number, pixelsPerSecond = 50): number {
    return time * pixelsPerSecond * scale
  }

  pixelsToTime(pixels: number, scale: number, pixelsPerSecond = 50): number {
    return pixels / (pixelsPerSecond * scale)
  }

  createTimelineClip(file: File, startTime: number, endTime: number, scale: number): TimelineClip {
    const duration = endTime - startTime
    const x = this.timeToPixels(startTime, scale)
    const width = this.timeToPixels(duration, scale)
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      startTime,
      endTime,
      duration,
      x,
      width,
      file,
      effects: []
    }
  }

  updateClipPosition(clip: TimelineClip, newX: number, scale: number): TimelineClip {
    const newStartTime = this.pixelsToTime(newX, scale)
    const newEndTime = newStartTime + clip.duration
    
    return {
      ...clip,
      startTime: newStartTime,
      endTime: newEndTime,
      x: newX
    }
  }

  resizeClip(clip: TimelineClip, newWidth: number, scale: number, resizeEnd = true): TimelineClip {
    const newDuration = this.pixelsToTime(newWidth, scale)
    
    if (resizeEnd) {
      return {
        ...clip,
        duration: newDuration,
        endTime: clip.startTime + newDuration,
        width: newWidth
      }
    } else {
      const newStartTime = clip.endTime - newDuration
      return {
        ...clip,
        startTime: newStartTime,
        duration: newDuration,
        x: this.timeToPixels(newStartTime, scale),
        width: newWidth
      }
    }
  }
}
