export type User = {
  id: string
  name: string
  // original api uses `username` for name and `profile_description` for description
  username?: string
  avatar?: string | null
  description?: string
  // optional stats from profile
  stars_count?: number
  subs_count?: number
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
