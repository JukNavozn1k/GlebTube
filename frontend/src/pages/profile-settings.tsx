

import { useRef, useState } from "react"
import { Header } from "@/components/header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"

export default function ProfileSettingsPage() {
  const { user, setAvatarFile, setDescription } = useUser()
  const fileRef = useRef<HTMLInputElement>(null)
  const [desc, setDesc] = useState<string>(user.description ?? "")
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function onPickAvatar(files: FileList | null) {
    const f = files?.[0]
    if (!f) return
    await setAvatarFile(f)
  }

  function onSave() {
    setSaving(true)
    setDescription(desc)
    setSaving(false)
    router.push("/profile")
  }

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <Header />
      <main className="mx-auto max-w-2xl px-3 sm:px-4 py-6 grid gap-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Настройки профиля</h1>

        <section className="grid gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-blue-200">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>GL</AvatarFallback>
              </Avatar>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => onPickAvatar(e.target.files)}
              />
            </div>
            <Button
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
              onClick={() => fileRef.current?.click()}
            >
              Изменить аватар
            </Button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc">Описание канала</Label>
            <Textarea
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={6}
              placeholder="Расскажите о себе и своём канале"
              className="focus-visible:ring-blue-600"
            />
          </div>

          <div className="flex gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onSave}
              disabled={saving}
              aria-disabled={saving}
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/profile")}>
              Отмена
            </Button>
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  )
}
