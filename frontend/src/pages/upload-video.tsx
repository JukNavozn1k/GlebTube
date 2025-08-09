
import { useState } from "react"
import { Header } from "@/components/glebtube/header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { addUpload } from "@/lib/glebtube-storage"
import { currentUser } from "@/lib/glebtube-user"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/glebtube/bottom-nav"

export default function UploadPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      channel: currentUser.name,
      duration: "00:00",
      src,
      thumbnail,
      description: description.trim(),
      baseStars: 0,
      tags: [],
      uploaderId: currentUser.id,
    } as any)
    setSubmitting(false)
    router.push(`/watch/${v.id}`)
  }

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <Header />
      <main className="mx-auto max-w-2xl px-3 sm:px-4 py-6 grid gap-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Загрузка видео</h1>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Название</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc">Описание</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="thumb">Превью (изображение)</Label>
            <Input
              id="thumb"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="video">Видео (mp4/webm)</Label>
            <Input
              id="video"
              type="file"
              accept="video/mp4,video/webm"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onSubmit}
              disabled={submitting}
              aria-disabled={submitting}
            >
              {submitting ? "Загрузка..." : "Опубликовать"}
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Примечание: файлы загружаются как временные ссылки (object URL) и работают только в текущей вкладке. Для
          постоянного хранения подключим облачное хранилище.
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
