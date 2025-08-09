"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Upload, UserRound, ListVideo } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()
  const items = [
    { href: "/", label: "Главная", icon: Home },
    { href: "/subscriptions", label: "Подписки", icon: ListVideo },
    { href: "/upload", label: "Загрузить", icon: Upload },
    { href: "/profile", label: "Профиль", icon: UserRound },
  ]
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-white sm:hidden">
      <ul className="flex items-stretch justify-around">
        {items.map((it) => {
          const active = pathname === it.href
          const Icon = it.icon
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
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
