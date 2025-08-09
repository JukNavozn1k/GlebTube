"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, Upload, ListVideo } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { GlebTubeLogo } from "./logo"
import { useUser } from "@/hooks/use-user"

type HeaderProps = {
  className?: string
  showSearch?: boolean
}

export function Header({ className = "", showSearch = true }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [q, setQ] = useState<string>(params.get("q") || "")
  const { user } = useUser()

  useEffect(() => {
    setQ(params.get("q") || "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get("q")])

  function onSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const target = q.trim()
    const url = "/?q=" + encodeURIComponent(target)
    if (pathname !== "/") router.push(url)
    else router.push(url)
  }

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
                  className="rounded-l-full rounded-r-none border-blue-200 focus-visible:ring-blue-600"
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
            <Link href="/subscriptions" className="hidden sm:block">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
                <ListVideo className="h-4 w-4 mr-2" />
                Подписки
              </Button>
            </Link>
            <Link href="/upload" className="hidden sm:block">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
                <Upload className="h-4 w-4 mr-2" />
                Загрузить
              </Button>
            </Link>
            <Link href="/profile" aria-label="Мой профиль">
              <Avatar className="h-8 w-8 border border-blue-200">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>GL</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
