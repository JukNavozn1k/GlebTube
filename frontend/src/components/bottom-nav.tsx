

import {Link} from "react-router-dom"
import { useLocation } from "react-router-dom"
import { Home, Upload, UserRound, ListVideo } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const { pathname } = useLocation()
  const items = [
    { to: "/", label: "Главная", icon: Home },
    { to: "/subscriptions", label: "Подписки", icon: ListVideo },
    { to: "/upload", label: "Загрузить", icon: Upload },
    { to: "/profile", label: "Профиль", icon: UserRound },
  ]
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-white sm:hidden">
      <ul className="flex items-stretch justify-around">
        {items.map((it) => {
          const active = pathname === it.to
          const Icon = it.icon
          return (
            <li key={it.to} className="flex-1">
              <Link
                to={it.to}
                className={cn(
                  "flex flex-col items-center justify-center py-2 text-xs",
                  active ? "text-blue-700" : "text-gray-600",
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "text-blue-700" : "text-gray-600")} />
                <span>{it.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
