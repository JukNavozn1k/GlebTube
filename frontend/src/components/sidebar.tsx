import type React from "react"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom" // заменили
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  Upload,
  ListVideo,
  Users,
  User,
  Settings,
  LogOut,
  VideoIcon,
  Star,
  History,
  ChevronDown,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useUser } from "@/hooks/use-user"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SidebarProps = {
  className?: string
  onWidthChange?: (width: number) => void
  onCollapseChange?: (collapsed: boolean) => void
}

export function Sidebar({ className = "", onWidthChange, onCollapseChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false)

  const location = useLocation()
  const pathname = location.pathname
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const { auth, logout } = useAuth()
  const { user } = useUser()

  const expandedWidth = 280
  const collapsedWidth = 72

  useEffect(() => {
    onWidthChange?.(collapsed ? collapsedWidth : expandedWidth)
  }, [collapsed, onWidthChange])

  useEffect(() => {
    onCollapseChange?.(collapsed)
  }, [collapsed, onCollapseChange])

  const navigationItems = [
    { href: "/", label: "Главная", icon: Home },
    { href: "/channels", label: "Каналы", icon: Users },
    { href: "/subscriptions", label: "Подписки", icon: ListVideo },
  ]

  const libraryItems = [
    { href: "/history", label: "История", icon: History },
    { href: "/starred", label: "Избранное", icon: Star },
    { href: "/profile?tab=videos", label: "Мои видео", icon: VideoIcon },
  ]

  const userItems = [
    { href: "/profile", label: "Профиль", icon: User },
    { href: "/profile/settings", label: "Настройки", icon: Settings },
    { href: "/upload", label: "Загрузить", icon: Upload },
  ]

  function initials(name: string) {
    const parts = name.trim().split(" ")
    const s = (parts[0]?.[0] || "") + (parts[1]?.[0] || "")
    return s.toUpperCase() || "US"
  }

  function handleItemClick(href: string, e: React.MouseEvent) {
    if (
      !auth.loggedIn &&
      (href.startsWith("/profile") ||
        href === "/upload" ||
        href === "/subscriptions" ||
        href === "/history" ||
        href === "/starred")
    ) {
      e.preventDefault()
      const returnUrl = encodeURIComponent(href)
      navigate(`/auth?returnUrl=${returnUrl}`)
    }
  }

  function isActiveItem(href: string): boolean {
    if (href === "/" && pathname === "/") return true
    if (href === "/channels" && pathname === "/channels") return true
    if (href === "/subscriptions" && pathname === "/subscriptions") return true
    if (href === "/history" && pathname === "/history") return true
    if (href === "/starred" && pathname === "/starred") return true

    if (href.includes("tab=")) {
      const tabParam = searchParams.get("tab")
      if (href.includes("tab=videos") && pathname === "/profile" && tabParam === "videos") return true
      return false
    }

    if (href === "/profile" && pathname === "/profile" && !searchParams.get("tab")) return true
    if (href === "/profile/settings" && pathname === "/profile/settings") return true
    if (href === "/upload" && pathname === "/upload") return true

    return false
  }

  return (
    <>
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 z-30 transition-all duration-300 hidden lg:flex flex-col overflow-hidden",
          className,
        )}
        style={{ width: collapsed ? collapsedWidth : expandedWidth }}
      >
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 p-0"
              aria-label={collapsed ? "Развернуть сайдбар" : "Свернуть сайдбар"}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          {!collapsed && <div className="text-base font-semibold text-gray-900">Навигация</div>}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          <div className="px-3 mb-6">
            {!collapsed && <div className="text-xs font-semibold text-gray-500 uppercase mb-2 px-3">Основное</div>}
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveItem(item.href)
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={(e) => handleItemClick(item.href, e)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      collapsed && "justify-center",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>

          <Separator className="mx-3 mb-6" />

          <div className="px-3 mb-6">
            {!collapsed && <div className="text-xs font-semibold text-gray-500 uppercase mb-2 px-3">Библиотека</div>}
            <nav className="space-y-1">
              {libraryItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveItem(item.href)
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={(e) => handleItemClick(item.href, e)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      collapsed && "justify-center",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>

          <Separator className="mx-3 mb-6" />

          <div className="px-3">
            {!collapsed && <div className="text-xs font-semibold text-gray-500 uppercase mb-2 px-3">Аккаунт</div>}
            <nav className="space-y-1">
              {userItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveItem(item.href)
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={(e) => handleItemClick(item.href, e)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      collapsed && "justify-center",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg p-2 hover:bg-gray-100 transition-colors",
                  collapsed && "justify-center",
                )}
                aria-label="Меню пользователя"
              >
                <Avatar className="h-8 w-8 border border-blue-200 flex-shrink-0">
                  <AvatarImage
                    src={auth.loggedIn ? user.avatar || "/placeholder.svg" : "/placeholder.svg"}
                    alt={auth.loggedIn ? auth.name || user.name : "Гость"}
                  />
                  <AvatarFallback className="text-xs">
                    {auth.loggedIn ? initials(auth.name || user.name || "User") : "?"}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-medium truncate">
                      {auth.loggedIn ? auth.name || user.name || "User" : "Войти"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {auth.loggedIn ? "Нажмите для меню" : "Нажмите для входа"}
                    </div>
                  </div>
                )}
                {!collapsed && <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={collapsed ? "center" : "start"} className="min-w-[240px]">
              {auth.loggedIn ? (
                <>
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
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-700"
                    onClick={() => {
                      setTimeout(() => {
                        setConfirmLogoutOpen(true)
                      }, 100)
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>Добро пожаловать!</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/auth")}>
                    <User className="h-4 w-4" />
                    <span>Войти</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={confirmLogoutOpen} onOpenChange={setConfirmLogoutOpen}>
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
                setConfirmLogoutOpen(false)
                logout()
              }}
            >
              Выйти
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
