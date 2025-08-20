import type React from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Search, Upload, ListVideo, Users, ChevronDown, LogOut, User, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"
import { GlebTubeLogo } from "./logo"
import { useUser } from "@/hooks/use-user"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
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

type HeaderProps = {
  className?: string
  showSearch?: boolean
  sidebarCollapsed?: boolean
}

function initials(username: string) {
  const parts = username.trim().split(" ")
  const s = (parts[0]?.[0] || "") + (parts[1]?.[0] || "")
  return s.toUpperCase() || "US"
}

export function Header({ className = "", showSearch = true }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [q, setQ] = useState<string>(searchParams.get("q") || "")
  const { user } = useUser()
  const { auth, logout } = useAuth()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    const updateWidth = () => {
      setWindowWidth(window.innerWidth)
    }
    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  useEffect(() => {
    setQ(searchParams.get("q") || "")
  }, [searchParams])

  function onSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const target = q.trim()
    setSearchParams({ q: target })
    if (location.pathname !== "/") {
      navigate(`/?q=${encodeURIComponent(target)}`)
    }
  }

  const displayInitials = useMemo(() => initials(auth.username || user.username || "User"), [auth.username, user.username])

  const isMobile = windowWidth < 1024
  const showLogo = isMobile || windowWidth >= 1024

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="flex h-14 items-center gap-3 justify-between">
          {showLogo && <GlebTubeLogo className="flex-shrink-0" />}

          {showSearch && (
            <form onSubmit={onSubmit} className="flex-1 max-w-xl mx-auto">
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

          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            {auth.loggedIn ? (
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="inline-flex items-center gap-2 rounded-full px-1.5 py-1 hover:bg-blue-50 focus-visible:outline-none"
                    aria-label="Меню пользователя"
                  >
                    <Avatar className="h-8 w-8 border border-blue-200">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={auth.username || user.username} />
                      <AvatarFallback>{displayInitials}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[240px]">
                  <DropdownMenuLabel className="line-clamp-1">{auth.username || user.username || "User"}</DropdownMenuLabel>
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
                      setTimeout(() => {
                        setConfirmOpen(true)
                      }, 100)
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate("/auth")}>
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>

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
                logout()
              }}
            >
              Выйти
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
