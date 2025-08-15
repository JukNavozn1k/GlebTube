import type { User } from "@/types/user"

export const channels: User[] = [
  {
    id: "vercel",
    username: "Vercel",
    avatar: "/blue-channel-avatar.png",
    bio: "Официальный канал Vercel — платформы для фронтенд-разработчиков. Здесь вы найдете обучающие материалы по Next.js, React, и современным веб-технологиям.",
    subscriberCount: 125000,
    videoCount: 45,
    joinedAt: "2020-03-15T00:00:00.000Z",
    website: "https://vercel.com",
  },
  {
    id: "nextjs",
    username: "Next.js",
    avatar: "/blue-accented-code-editor.png",
    bio: "Изучайте Next.js — React-фреймворк для продакшена. Туториалы, лучшие практики и новости о разработке.",
    subscriberCount: 89000,
    videoCount: 32,
    joinedAt: "2019-10-24T00:00:00.000Z",
    website: "https://nextjs.org",
  },
  {
    id: "edge-academy",
    username: "Edge Academy",
    avatar: "/placeholder-3sfuq.png",
    bio: "Академия Edge-вычислений. Изучайте современные подходы к распределенным системам и граничным вычислениям.",
    subscriberCount: 34000,
    videoCount: 18,
    joinedAt: "2021-06-12T00:00:00.000Z",
  },
  {
    id: "react-labs",
    username: "React Labs",
    avatar: "/placeholder-9bxl7.png",
    bio: "Экспериментальные возможности React, исследования производительности и будущее библиотеки.",
    subscriberCount: 156000,
    videoCount: 67,
    joinedAt: "2018-05-08T00:00:00.000Z",
    website: "https://react.dev",
  },
  {
    id: "css-pro",
    username: "CSS Pro",
    avatar: "/tailwind-components-gallery-blue-white.png",
    bio: "Профессиональные техники CSS, Tailwind CSS и современная стилизация веб-приложений.",
    subscriberCount: 67000,
    videoCount: 28,
    joinedAt: "2020-11-03T00:00:00.000Z",
  },
]

export function getChannelById(id: string): User | undefined {
  return channels.find((channel) => channel.id === id)
}

export function getChannelByName(username: string): User {
  const existing = channels.find((channel) => channel.username.toLowerCase() === username.toLowerCase())

  if (existing) {
    return existing
  }

  // Создаём новый канал для неизвестных имён
  return {
    id: username.toLowerCase().replace(/\s+/g, "-"),
    username,
    bio: `Канал ${username}`,
    subscriberCount: Math.floor(Math.random() * 10000) + 1000,
    videoCount: 0,
    joinedAt: new Date().toISOString(),
  }
}

export function getAllChannels(): User[] {
  return channels
}
