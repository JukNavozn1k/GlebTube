export type User = {
  id: string
  username: string
  email?: string
  avatar?: string
  bio?: string
  subscriberCount?: number
  videoCount?: number
  joinedAt?: string
  location?: string
  website?: string
}


export type AuthState = {
  loggedIn: boolean
  username: string
  // currentUser is the latest profile returned by the use-case (null when not authenticated)
  currentUser?: {
    id: number
    username: string
    avatar?: string | null
    bio?: string
    baseStars?: number
    subscriberCount?: number
  } | null
}
