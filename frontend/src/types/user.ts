export type User = {
  id: string
  name: string
  handle: string
  avatar: string
  description?: string
}

export type AuthState = {
  loggedIn: boolean
  name: string
}
