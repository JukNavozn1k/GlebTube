"use client"

import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { videos as builtins, type Video, formatViews } from "@/lib/glebtube-data"
import { getUploads, isSubscribed, toggleSubscription } from "@/lib/glebtube-storage"
import { Button } from "@/components/ui/button"
import { VideoCard } from "@/components/video-card"
import { BottomNav } from "@/components/bottom-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar, Users, VideoIcon, BarChart3 } from "lucide-react"

function nameFromSlug(slug: string) {
  return decodeURIComponent(String(slug)).toLowerCase()
}

function initials(name: string) {
  const parts = name.trim().split(" ")
  const s = (parts[0]?.[0] || "") + (parts[1]?.[0] || "")
  return s.toUpperCase() || "US"
}

export function ChannelPage() {
  const { slug } = useParams<{ slug: string }>()
  const uploads = getUploads()
  const all: Video[] = useMemo(() => [...uploads, ...builtins], [uploads])
  const channelNameLower = nameFromSlug(slug)
  const channelVideos = all.filter((v) => v.channel.toLowerCase() === channelNameLower)
  const channelName = channelVideos[0]?.channel || decodeURIComponent(slug)
  const [sub, setSub] = useState(isSubscribed(channelName))

  // Mock stats for demo
  const totalViews = channelVideos.reduce((sum, v) => sum + v.views, 0)
  const subscriberCount = Math.floor(Math.random() * 50000) + 1000 // Mock data
  const joinDate = "2023"

  // Sort videos by date (newest first)
  const sortedVideos = useMemo(() => {
    return [...channelVideos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [channelVideos])

  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0 overflow-x-hidden">
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-6">
        {/* Channel Header */}
        <section className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-blue-200 flex-shrink-0">
              <AvatarImage src="/blue-channel-avatar.png" alt={channelName} />
              <AvatarFallback className="text-lg">{initials(channelName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold break-words hyphens-auto overflow-wrap-anywhere">
                {channelName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>{formatViews(subscriberCount)} подписчиков</span>
                </div>
                <div className="flex items-center gap-1">
                  <VideoIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{channelVideos.length} видео</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Дата регистрации: {joinDate}</span>
                </div>
              </div>
            </div>
            <Button
              size="lg"
              variant={sub ? "default" : "outline"}
              className={
                sub
                  ? "bg-blue-600 text-white hover:bg-blue-700 flex-shrink-0"
                  : "border-blue-200 text-blue-700 hover:bg-blue-50 flex-shrink-0"
              }
              onClick={() => setSub(toggleSubscription(channelName))}
            >
              {sub ? "Вы подписаны" : "Подписаться"}
            </Button>
          </div>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="videos" className="flex items-center gap-1 py-1.5 px-2">
              <VideoIcon className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs hidden md:inline">Видео</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-1 py-1.5 px-2">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs hidden md:inline">О канале</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1 py-1.5 px-2">
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs hidden md:inline">Статистика</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-0">
            {sortedVideos.length === 0 ? (
              <div className="text-center py-12">
                <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Нет видео</h3>
                <p className="text-sm text-muted-foreground">У этого канала пока нет опубликованных видео.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {sortedVideos.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-0">
            <div className="max-w-4xl">
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Описание канала</h3>
                <p className="text-gray-700 whitespace-pre-wrap break-words hyphens-auto overflow-wrap-anywhere">
                  {channelName === "Vercel"
                    ? "Официальный канал Vercel — платформы для фронтенд-разработчиков. Здесь вы найдете обучающие материалы по Next.js, React, и современным веб-технологиям."
                    : channelName === "Next.js"
                      ? "Изучайте Next.js — React-фреймворк для продакшена. Туториалы, лучшие практики и новости о разработке."
                      : channelName === "Edge Academy"
                        ? "Академия Edge-вычислений. Изучайте современные подходы к распределенным системам и граничным вычислениям."
                        : channelName === "React Labs"
                          ? "Экспериментальные возможности React, исследования производительности и будущее библиотеки."
                          : channelName === "CSS Pro"
                            ? "Профессиональные техники CSS, Tailwind CSS и современная стилизация веб-приложений."
                            : `Добро пожаловать на канал ${channelName}! Здесь вы найдете интересный контент и полезную информацию.`}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-white border border-blue-100 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Подписчики
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">{formatViews(subscriberCount)}</p>
                </div>

                <div className="bg-white border border-blue-100 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <VideoIcon className="h-4 w-4 text-blue-600" />
                    Всего видео
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">{channelVideos.length}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <div className="max-w-4xl">
              <h3 className="text-lg font-semibold mb-6">Статистика канала</h3>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <h4 className="font-semibold mb-2 text-blue-800">Общие просмотры</h4>
                  <p className="text-3xl font-bold text-blue-600">{formatViews(totalViews)}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <h4 className="font-semibold mb-2 text-green-800">Подписчики</h4>
                  <p className="text-3xl font-bold text-green-600">{formatViews(subscriberCount)}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                  <h4 className="font-semibold mb-2 text-purple-800">Видео</h4>
                  <p className="text-3xl font-bold text-purple-600">{channelVideos.length}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h4 className="font-semibold mb-4">Популярные видео</h4>
                <div className="space-y-3">
                  {sortedVideos
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5)
                    .map((video, index) => (
                      <div key={video.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1 break-words hyphens-auto">{video.title}</p>
                          <p className="text-sm text-muted-foreground">{formatViews(video.views)} просмотров</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  )
}
