
import type React from "react"

import { useRef, useState, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/use-user"
import { useNavigate } from "react-router-dom"
import { BottomNav } from "@/components/bottom-nav"
import { Upload, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProfileSettingsPage() {
  const { user, setAvatarFile, setDescription } = useUser()
  const fileRef = useRef<HTMLInputElement>(null)
  const [desc, setDesc] = useState<string>(user.bio ?? "")
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      const file = files[0]

      if (!file) return

      if (file.type.startsWith("image/")) {
        const dataUrl = await fileToDataUrl(file)
        setPreviewAvatar(dataUrl)
        await setAvatarFile(file)
      }
    },
    [setAvatarFile],
  )

  async function onPickAvatar(files: FileList | null) {
    const f = files?.[0]
    if (!f) return
    const dataUrl = await fileToDataUrl(f)
    setPreviewAvatar(dataUrl)
    await setAvatarFile(f)
  }

  function onSave() {
    setSaving(true)
    setDescription(desc)
    setSaving(false)
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

  const currentAvatar = previewAvatar || user.avatar || "/placeholder.svg"

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-2xl px-3 sm:px-4 py-6 grid gap-6">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Настройки профиля</h1>
          <p className="text-muted-foreground">Персонализируйте свой канал</p>
        </div>

        <section className="grid gap-6">
          {/* Avatar Upload with Drag & Drop */}
          <div className="grid gap-4">
            <Label>Аватар профиля</Label>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 border-2 border-blue-200">
                <AvatarImage src={currentAvatar || "/placeholder.svg"} alt={user.username} />
                <AvatarFallback className="text-lg">GL</AvatarFallback>
              </Avatar>

              <div
                className={cn(
                  "flex-1 border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                  dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => onPickAvatar(e.target.files)}
                />
                <div className="space-y-2">
                  <Upload className="h-6 w-6 mx-auto text-gray-400" />
                  <div className="font-medium">Перетащите изображение сюда</div>
                  <div className="text-sm text-muted-foreground">или нажмите для выбора файла</div>
                  <div className="text-xs text-muted-foreground">JPG, PNG, GIF до 5MB</div>
                </div>
              </div>
            </div>
          </div>

          {/* Channel Description */}
          <div className="grid gap-2">
            <Label htmlFor="desc">Описание канала</Label>
            <Textarea
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={8}
              placeholder="Расскажите о себе и своём канале..."
              className="focus-visible:ring-blue-600"
            />
            <div className="text-xs text-muted-foreground">{desc.length}/1000 символов</div>
          </div>

          {/* Action Buttons */}
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
            <Button variant="outline" onClick={() => navigate("/profile")}>
              Отмена
            </Button>
          </div>
        </section>

        <div className="text-xs text-muted-foreground bg-blue-50 p-4 rounded-lg">
          <strong>Совет:</strong> Используйте качественное изображение для аватара. Рекомендуемый размер: 200x200
          пикселей.
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
