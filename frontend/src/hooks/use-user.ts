

import { useEffect, useState } from "react"
import { currentUser as defaultUser, type User } from "@/lib/glebtube-user"

const AVATAR_KEY = "glebtube:user:avatar"
const DESC_KEY = "glebtube:user:desc"

export function useUser() {
  const [user, setUser] = useState<User>(defaultUser)

  useEffect(() => {
    if (typeof window === "undefined") return
    const savedAvatar = localStorage.getItem(AVATAR_KEY)
    const savedDesc = localStorage.getItem(DESC_KEY)
    setUser((u) => ({
      ...u,
      avatar: savedAvatar || u.avatar,
      description: savedDesc ?? u.description ?? "",
    }))
  }, [])

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
