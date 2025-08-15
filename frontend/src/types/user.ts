export type User = {
  id: string
  name: string
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
  name: string
  // currentUser is the latest profile returned by the use-case (null when not authenticated)
  currentUser?: {
    id: number
    username: string
    avatar?: string | null
    profile_description?: string
    stars_count?: number
    subs_count?: number
  } | null
}
