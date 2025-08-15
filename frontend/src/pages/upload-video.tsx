
import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { addUpload } from "@/lib/glebtube-storage"
import { currentUser } from "@/lib/glebtube-user"
import { useNavigate } from "react-router-dom"
import { BottomNav } from "@/components/bottom-nav"
import { Upload, X, FileVideo, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProtectedRoute } from "@/hooks/use-protected-route"

export function UploadPage() {
  const navigate = useNavigate()
  const isAuthorized = useProtectedRoute("/upload")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<"video" | "thumb" | null>(null)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent, type: "video" | "thumb") => {
    e.preventDefault()
    setDragOver(type)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, type: "video" | "thumb") => {
    e.preventDefault()
    setDragOver(null)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (!file) return

    if (type === "video") {
      if (file.type.startsWith("video/")) {
        setVideoFile(file)
      } else {
        setError("Пожалуйста, выберите видеофайл")
      }
    } else {
      if (file.type.startsWith("image/")) {
        setThumbFile(file)
      } else {
        setError("Пожалуйста, выберите изображение")
      }
    }
  }, [])

  function onSubmit() {
    setError(null)
    if (!title.trim()) return setError("Укажите название")
    if (!videoFile) return setError("Выберите файл видео")

    // Create object URLs (valid for current session)
    const src = URL.createObjectURL(videoFile)
    const thumbnail = thumbFile ? URL.createObjectURL(thumbFile) : "/blue-white-thumbnail.png"

    setSubmitting(true)
    const v = addUpload({
      title: title.trim(),
      channel: currentUser.username,
      duration: "00:00",
      src,
      thumbnail,
      description: description.trim(),
      baseStars: 0,
      tags: [],
      uploaderId: currentUser.id,
    } as any)
    setSubmitting(false)
    navigate(`/watch/${v.id}`)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Если не авторизован, не рендерим содержимое
  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-4xl px-3 sm:px-4 py-6 grid gap-6">
        <div className="text-center">
          <Upload className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Загрузка видео</h1>
          <p className="text-muted-foreground">Поделитесь своим контентом с миром</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Video Upload */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Видеофайл *</Label>
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  dragOver === "video"
                    ? "border-blue-500 bg-blue-50"
                    : videoFile
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50",
                )}
                onDragOver={(e) => handleDragOver(e, "video")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "video")}
                onClick={() => videoInputRef.current?.click()}
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/mov,video/avi"
                  className="sr-only"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
                {videoFile ? (
                  <div className="space-y-2">
                    <FileVideo className="h-8 w-8 mx-auto text-green-600" />
                    <div className="font-medium text-green-700">{videoFile.name}</div>
                    <div className="text-sm text-green-600">{formatFileSize(videoFile.size)}</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        setVideoFile(null)
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Удалить
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileVideo className="h-8 w-8 mx-auto text-gray-400" />
                    <div className="font-medium">Перетащите видео сюда</div>
                    <div className="text-sm text-muted-foreground">или нажмите для выбора файла</div>
                    <div className="text-xs text-muted-foreground">MP4, WebM, MOV, AVI до 100MB</div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="grid gap-2">
              <Label>Превью (необязательно)</Label>
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                  dragOver === "thumb"
                    ? "border-blue-500 bg-blue-50"
                    : thumbFile
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50",
                )}
                onDragOver={(e) => handleDragOver(e, "thumb")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "thumb")}
                onClick={() => thumbInputRef.current?.click()}
              >
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                />
                {thumbFile ? (
                  <div className="space-y-2">
                    <ImageIcon className="h-6 w-6 mx-auto text-green-600" />
                    <div className="font-medium text-green-700">{thumbFile.name}</div>
                    <div className="text-sm text-green-600">{formatFileSize(thumbFile.size)}</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        setThumbFile(null)
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Удалить
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="h-6 w-6 mx-auto text-gray-400" />
                    <div className="font-medium">Перетащите изображение</div>
                    <div className="text-xs text-muted-foreground">JPG, PNG, GIF до 5MB</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Details */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название видео"
                className="focus-visible:ring-blue-600"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="desc">Описание</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                placeholder="Расскажите о своем видео..."
                className="focus-visible:ring-blue-600"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="text-sm text-red-600">{error}</div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={onSubmit}
                disabled={submitting}
                aria-disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 mr-2 border border-white/30 border-t-white rounded-full animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Опубликовать
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => navigate("/profile")}>
                Отмена
              </Button>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-blue-50 p-4 rounded-lg">
          <strong>Примечание:</strong> Файлы загружаются как временные ссылки (object URL) и работают только в текущей
          вкладке. Для постоянного хранения подключим облачное хранилище.
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
