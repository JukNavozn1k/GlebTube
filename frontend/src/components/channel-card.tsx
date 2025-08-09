

import Link from "next/link"
import type { Video } from "@/lib/glebtube-data"
import { Button } from "@/components/ui/button"
import { isSubscribed, toggleSubscription } from "@/lib/glebtube-storage"
import { useState } from "react"

function slug(name: string) {
  return encodeURIComponent(name.toLowerCase())
}

type ChannelCardProps = {
  channel: string
  videos: Video[]
}

export function ChannelCard({ channel, videos }: ChannelCardProps) {
  const [sub, setSub] = useState(isSubscribed(channel))
  return (
    <div className="rounded-lg border border-blue-100 p-4 flex items-center gap-4">
      <Link
        href={`/channel/${slug(channel)}`}
        className="h-12 w-12 rounded-full bg-blue-100 border border-blue-200 shrink-0"
        aria-label={channel}
      />
      <div className="min-w-0 flex-1">
        <Link href={`/channel/${slug(channel)}`} className="font-medium hover:text-blue-700 line-clamp-1">
          {channel}
        </Link>
        <div className="text-xs text-muted-foreground">{videos.length} видео</div>
      </div>
      <Button
        size="sm"
        variant={sub ? "default" : "outline"}
        className={sub ? "bg-blue-600 text-white hover:bg-blue-700" : "border-blue-200 text-blue-700 hover:bg-blue-50"}
        onClick={() => setSub(toggleSubscription(channel))}
      >
        {sub ? "Вы подписаны" : "Подписаться"}
      </Button>
    </div>
  )
}
