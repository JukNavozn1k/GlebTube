import type React from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Search, Upload, ListVideo, Users, ChevronDown, LogOut, User, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect, useState, useMemo } from "react"
import { GlebTubeLogo } from "@/components/logo"
import { useUser } from "@/hooks/use-user"
import { useAuth } from "@/hooks/use-auth"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AuthDialog } from "@/components/auth-dialog"

type HeaderProps = {
  className?: string
  showSearch?: boolean
}

function initials(name: string) {
  const parts = name.trim().split(" ")
  const s = (parts[0]?.[0] || "") + (parts[1]?.[0] || "")
  return s.toUpperCase() || "US"
}

export function Header({ className = "", showSearch = true }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const [params] = useSearchParams()

  const [q, setQ] = useState<string>(params.get("q") || "")
  const { user } = useUser()
  const { auth, login, register, logout } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setQ(params.get("q") || "")
  }, [params])

  function onSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const target = q.trim()
    const url = "/?q=" + encodeURIComponent(target)
    navigate(url)
  }

  const displayInitials = useMemo(
    () => initials(auth.name || user.name || "User"),
    [auth.name, user.name]
  )

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="flex h-14 items-center gap-3">
          <GlebTubeLogo />

          {showSearch && (
            <form onSubmit={onSubmit} className="ml-auto flex-1 max-w-xl">
              <div className="relative flex">
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Поиск"
                  className="rounded-l-full rounded-r-none border-blue-200 focus-visible:ring-1 focus-visible:ring-blue-300 focus-visible:ring-offset-0 focus-visible:border-blue-400 shadow-none"
                />
                <Button
                  type="submit"
                  className="rounded-r-full rounded-l-none bg-blue-600 hover:bg-blue-700 text-white"
                  aria-label="Поиск"
                >
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Найти</span>
                </Button>
              </div>
            </form>
          )}

          <div className="hidden sm:flex items-center gap-2 ml-2">
            {auth.loggedIn ? (
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="inline-flex items-center gap-2 rounded-full px-1.5 py-1 hover:bg-blue-50 focus-visible:outline-none"
                    aria-label="Меню пользователя"
                  >
                    <Avatar className="h-8 w-8 border border-blue-200">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={auth.name || user.name} />
                      <AvatarFallback>{displayInitials}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[240px]">
                  <DropdownMenuLabel className="line-clamp-1">{auth.name || user.name || "User"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Профиль</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Настройки профиля</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Действия</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/subscriptions" className="flex items-center gap-2">
                      <ListVideo className="h-4 w-4" />
                      <span>Подписки</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/channels" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Каналы</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/upload" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      <span>Загрузить видео</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-700"
                    onClick={() => {
                      setMenuOpen(false)
                      setConfirmOpen(true)
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setAuthOpen(true)}
                aria-haspopup="dialog"
              >
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm logout dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Выйти из аккаунта?</AlertDialogTitle>
            <AlertDialogDescription>Подтвердите выход из учётной записи.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                setConfirmOpen(false)
                setMenuOpen(false)
                setTimeout(() => {
                  logout()
                }, 0)
              }}
            >
              Выйти
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Auth modal */}
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onLogin={(name) => login(name)}
        onRegister={(name) => register(name)}
      />
    </header>
  )
}
