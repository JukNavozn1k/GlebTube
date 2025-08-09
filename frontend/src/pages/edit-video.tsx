

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Header } from "@/components/header"
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

export default function EditVideoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [video, setVideo] = useState<UploadedVideo | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
        <Header />
        <main className="mx-auto max-w-2xl px-3 sm:px-4 py-6">
          <div className="text-lg font-semibold">Видео не найдено или не является загруженным.</div>
          <Button className="mt-4" onClick={() => router.push("/")}>
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
    router.push(`/watch/${video.id}`)
  }

  async function confirmDelete() {
    setDeleting(true)
    deleteUpload(video.id)
    setDeleting(false)
    router.push("/profile")
  }

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <Header />
      <main className="mx-auto max-w-2xl px-3 sm:px-4 py-6 grid gap-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Редактирование видео</h1>

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
            <Label htmlFor="thumb">Новое превью (изображение)</Label>
            <Input
              id="thumb"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onSave}
              disabled={saving}
              aria-disabled={saving}
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
            <Button variant="outline" onClick={() => router.push(`/watch/${video.id}`)}>
              Отмена
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="ml-auto" disabled={deleting} aria-disabled={deleting}>
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
      </main>
      <BottomNav />
    </div>
  )
}
