export type User = {
  id: string
  name: string
  handle: string
  avatar: string
  description?: string
}

export const currentUser: User = {
  id: "me",
  name: "Gleb",
  handle: "", // handle убран, оставляем только имя
  avatar: "/user-avatar-blue.png",
  description: "",
}
