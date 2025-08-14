
import { useEffect, useState } from "react"
import { currentUser as defaultUser } from "@/data/user"
import {type User} from "@/types/user"
import { useAuth } from "@/contexts/auth-context"

const AVATAR_KEY = "glebtube:user:avatar"
const DESC_KEY = "glebtube:user:desc"

export function useUser() {
  const { auth } = useAuth()
  const [user, setUser] = useState<User>(defaultUser)

  useEffect(() => {
    if (typeof window === "undefined") return
    const savedAvatar = localStorage.getItem(AVATAR_KEY)
    const savedDesc = localStorage.getItem(DESC_KEY)
    setUser((u) => ({
      ...u,
      name: auth.name || u.name, // синхронизируем имя с auth
      avatar: savedAvatar || u.avatar,
      description: savedDesc ?? u.description ?? "",
    }))
  }, [auth.name]) // добавляем зависимость от auth.name

  async function setAvatarFile(file: File) {
    const dataUrl = await fileToDataUrl(file)
    localStorage.setItem(AVATAR_KEY, dataUrl)
    setUser((u) => ({ ...u, avatar: dataUrl }))
  }

  function setDescription(desc: string) {
    localStorage.setItem(DESC_KEY, desc)
    setUser((u) => ({ ...u, description: desc }))
  }

  return { user, setAvatarFile, setDescription }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
