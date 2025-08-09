export type Video = {
  id: string
  title: string
  channel: string
  views: number
  createdAt: string
  duration: string
  src: string
  thumbnail: string
  description: string
  baseStars: number
  tags: string[]
}

export const videos: Video[] = [
  {
    id: "vercel-frontend-cloud",
    title: "Introducing the Frontend Cloud",
    channel: "Vercel",
    views: 1200345,
    createdAt: "2024-06-15T10:00:00.000Z",
    duration: "12:41",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnail: "https://cdn.fliki.ai/image/page/660ba680adaa44a37532fd97/666310fc647d79dc96fd21a3.jpg",
    description:
      "Learn how the Frontend Cloud accelerates modern web development with edge-first infrastructure, frameworks, and tooling.",
    baseStars: 2312,
    tags: ["frontend", "cloud", "vercel"],
  },
  {
    id: "nextjs-app-router",
    title: "Mastering Next.js App Router",
    channel: "Next.js",
    views: 853212,
    createdAt: "2024-08-02T12:00:00.000Z",
    duration: "18:05",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "https://cdn.fliki.ai/image/page/660ba680adaa44a37532fd97/666310fc647d79dc96fd21a3.jpg",
    description:
      "Deep dive into the App Router architecture, Server Actions, and streaming UI to build blazingly fast apps.",
    baseStars: 1278,
    tags: ["nextjs", "react", "router"],
  },
  {
    id: "edge-functions",
    title: "Edge Functions: From Zero to Production",
    channel: "Edge Academy",
    views: 402199,
    createdAt: "2024-11-10T08:30:00.000Z",
    duration: "09:57",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnail: "https://cdn.fliki.ai/image/page/660ba680adaa44a37532fd97/666310fc647d79dc96fd21a3.jpg",
    description:
      "Build latency-sensitive experiences with Edge Functions, understanding cold starts, isolation, and caching.",
    baseStars: 734,
    tags: ["edge", "functions", "performance"],
  },
  {
    id: "react-performance",
    title: "React Performance: Practical Patterns",
    channel: "React Labs",
    views: 991245,
    createdAt: "2025-03-22T15:45:00.000Z",
    duration: "22:14",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnail: "https://cdn.fliki.ai/image/page/660ba680adaa44a37532fd97/666310fc647d79dc96fd21a3.jpg",
    description:
      "Profiler-driven techniques, memoization strategies, and concurrent features to keep React apps snappy.",
    baseStars: 3134,
    tags: ["react", "performance"],
  },
  {
    id: "tailwind-recipes",
    title: "Tailwind CSS Recipes for Real Apps",
    channel: "CSS Pro",
    views: 210934,
    createdAt: "2025-05-05T09:00:00.000Z",
    duration: "14:02",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnail: "https://cdn.fliki.ai/image/page/660ba680adaa44a37532fd97/666310fc647d79dc96fd21a3.jpg",
    description: "Build responsive, accessible components fast with Tailwind CSS and utility-first patterns.",
    baseStars: 512,
    tags: ["css", "tailwind"],
  },
]

export function formatViews(n: number) {
  if (n < 1000) return `${n}`
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} mo ago`
  const years = Math.floor(months / 12)
  return `${years} yr ago`
}
