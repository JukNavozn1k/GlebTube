
import { useEffect, useState } from "react"
import { currentUser as defaultUser } from "@/data/user"
import {type User} from "@/types/user"
import { useAuth } from "@/contexts/auth-context"

const AVATAR_KEY = "glebtube:user:avatar"
const BIO_KEY = "glebtube:user:bio"

export function useUser() {
  const { auth } = useAuth()
  const [user, setUser] = useState<User>(defaultUser)


    useEffect(() => {
      if (typeof window === "undefined") return
      const savedAvatar = localStorage.getItem(AVATAR_KEY)
      const savedBio = localStorage.getItem(BIO_KEY)

      // If auth.currentUser is present, prefer fields from it. Otherwise fall back to auth.username and local storage.
      const profile = auth.currentUser

      setUser((u) => ({
        ...u,
        id: profile ? String(profile.id) : u.id,
        username: profile?.username || auth.username || u.username,
        avatar: profile?.avatar ?? savedAvatar ?? u.avatar,
        bio: profile?.bio ?? savedBio ?? u.bio ?? "",
        baseStars: profile?.baseStars ?? u.baseStars,
        subscriberCount: profile?.subscriberCount ?? u.subscriberCount,
      }))
    }, [auth.username, auth.currentUser])
  async function setAvatarFile(file: File) {
    const dataUrl = await fileToDataUrl(file)
    localStorage.setItem(AVATAR_KEY, dataUrl)
    setUser((u) => ({ ...u, avatar: dataUrl }))
  }

  function setBio(bio: string) {
    localStorage.setItem(BIO_KEY, bio)
    setUser((u) => ({ ...u, bio: bio }))
  }

  return { user, setAvatarFile, setBio }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
