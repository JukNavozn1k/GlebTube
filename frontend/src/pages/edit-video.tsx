
import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { getUploads, updateUpload, deleteUpload, type UploadedVideo } from "@/lib/glebtube-storage"
import { BottomNav } from "@/components/bottom-nav"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { X, ImageIcon, Edit } from "lucide-react"
import { cn } from "@/lib/utils"

export function EditVideoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [video, setVideo] = useState<UploadedVideo | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [previewThumb, setPreviewThumb] = useState<string | null>(null)

  const thumbInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (!file) return

    if (file.type.startsWith("image/")) {
      const dataUrl = await fileToDataUrl(file)
      setPreviewThumb(dataUrl)
      setThumbFile(file)
    }
  }, [])

  useEffect(() => {
    const v = getUploads().find((u) => u.id === id) || null
    setVideo(v || null)
    if (v) {
      setTitle(v.title)
      setDescription(v.description)
    }
  }, [id])

  if (!video) {
    return (
      <div className="min-h-dvh bg-white pb-14 sm:pb-0">
        <main className="mx-auto max-w-2xl px-3 sm:px-4 py-6">
          <div className="text-lg font-semibold">Видео не найдено или не является загруженным.</div>
          <Button className="mt-4" onClick={() => navigate("/")}>
            На главную
          </Button>
        </main>
        <BottomNav />
      </div>
    )
  }

  function onSave() {
    setSaving(true)
    const patch: Partial<UploadedVideo> = {
      title: title.trim() || video.title,
      description: description.trim(),
    }
    if (thumbFile) {
      patch.thumbnail = URL.createObjectURL(thumbFile)
    }
    updateUpload(video.id, {
      title: patch.title,
      description: patch.description,
      thumbnail: patch.thumbnail,
    })
    setSaving(false)
    navigate(`/watch/${video.id}`)
  }

  async function confirmDelete() {
    setDeleting(true)
    deleteUpload(video.id)
    setDeleting(false)
    navigate("/profile")
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const formatFileSize = (file: File) => {
    const bytes = file.size
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const currentThumb = previewThumb || video.thumbnail

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-4xl px-3 sm:px-4 py-6 grid gap-6">
        <div className="text-center">
          <Edit className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Редактирование видео</h1>
          <p className="text-muted-foreground">Обновите информацию о вашем видео</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Video Info */}
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

            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={onSave}
                disabled={saving}
                aria-disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 mr-2 border border-white/30 border-t-white rounded-full animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Сохранить изменения"
                )}
              </Button>
              <Button variant="outline" onClick={() => navigate(`/watch/${video.id}`)}>
                Отмена
              </Button>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Превью видео</Label>
              {currentThumb && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentThumb || "/placeholder.svg"} alt="Превью" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium">Текущее превью</span>
                  </div>
                </div>
              )}

              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                  dragOver
                    ? "border-blue-500 bg-blue-50"
                    : thumbFile
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => thumbInputRef.current?.click()}
              >
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      fileToDataUrl(file).then((dataUrl) => {
                        setPreviewThumb(dataUrl)
                        setThumbFile(file)
                      })
                    }
                  }}
                />
                {thumbFile ? (
                  <div className="space-y-2">
                    <ImageIcon className="h-8 w-8 mx-auto text-green-600" />
                    <div className="font-medium text-green-700">Новое превью: {thumbFile.name}</div>
                    <div className="text-sm text-green-600">{formatFileSize(thumbFile)}</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        setThumbFile(null)
                        setPreviewThumb(null)
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Отменить
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                    <div className="font-medium">Перетащите новое превью</div>
                    <div className="text-sm text-muted-foreground">или нажмите для выбора файла</div>
                    <div className="text-xs text-muted-foreground">JPG, PNG, GIF до 5MB</div>
                  </div>
                )}
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={deleting} aria-disabled={deleting}>
                  Удалить видео
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить это видео?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Действие необратимо. Видео будет удалено с этого устройства.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-blue-50 p-4 rounded-lg">
          <strong>Совет:</strong> Используйте качественное изображение для превью. Рекомендуемое соотношение сторон:
          16:9.
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
