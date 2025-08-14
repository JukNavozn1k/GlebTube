import { Link, useLocation } from "react-router-dom"
import { Home, Upload, UserRound, ListVideo, Users, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import { AuthDialog } from "@/components/auth-dialog"

export function BottomNav() {
  const location = useLocation()
  const pathname = location.pathname
  const { auth, login, register } = useAuth()
  const [open, setOpen] = useState(false)

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
    { to: "#login", label: "Войти", icon: LogIn, type: "login" as const },
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
                  <button
                    className="w-full h-full flex flex-col items-center justify-center py-2 text-xs text-gray-600"
                    onClick={() => setOpen(true)}
                    aria-haspopup="dialog"
                    aria-controls="auth-dialog-mobile"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{it.label}</span>
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Auth dialog for mobile */}
      <AuthDialog
        open={open}
        onOpenChange={setOpen}
        onLogin={(name) => {
          login(name)
          setOpen(false)
        }}
        onRegister={(name) => {
          register(name)
          setOpen(false)
        }}
      />
    </>
  )
}
