import type { User } from "@/types/user"

export const currentUser: User = {
  id: "me",
  name: "Gleb",
  handle: "", // handle убран, оставляем только имя
  avatar: "/user-avatar-blue.png",
  description: "",
}
