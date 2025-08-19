import { Link, useLocation } from "react-router-dom"
import { Home, Upload, UserRound, ListVideo, Users, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

export function BottomNav() {
  const location = useLocation()
  const pathname = location.pathname
  const { auth } = useAuth()
  

  const loggedInItems = [
    { to: "/", label: "Главная", icon: Home, type: "link" as const },
    { to: "/channels", label: "Каналы", icon: Users, type: "link" as const },
    { to: "/subscriptions", label: "Подписки", icon: ListVideo, type: "link" as const },
    { to: "/upload", label: "Загрузить", icon: Upload, type: "link" as const },
    { to: "/profile", label: "Профиль", icon: UserRound, type: "link" as const },
  ]

  const loggedOutItems = [
    { to: "/", label: "Главная", icon: Home, type: "link" as const },
    { to: "/channels", label: "Каналы", icon: Users, type: "link" as const },
    { to: "/auth", label: "Войти", icon: LogIn, type: "link" as const },
  ]

  const items = auth.loggedIn ? loggedInItems : loggedOutItems

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-white sm:hidden">
        <ul className="flex items-stretch justify-around">
          {items.map((it) => {
            const active = it.type === "link" && pathname === it.to
            const Icon = it.icon
            return (
              <li key={it.label} className="flex-1">
                {it.type === "link" ? (
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
                ) : (
                  <Link
                    className="w-full h-full flex flex-col items-center justify-center py-2 text-xs text-gray-600"
                    to={it.to} >
                      
                    <Icon className="h-5 w-5" />
                    <span>{it.label}</span>
                    
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

    </>
  )
}
