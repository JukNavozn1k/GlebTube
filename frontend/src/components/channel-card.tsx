
import {Link} from "react-router-dom"

import type { Video } from "@/types/video"
import type { User } from "@/types/user"
import { Button } from "@/components/ui/button"
import { isSubscribed, toggleSubscription } from "@/utils/storage"
import { useState } from "react"
import { Users, VideoIcon } from "lucide-react"
import { formatViews } from "@/utils/format"

type ChannelCardProps = {
  channel: User | null
  videos: Video[]
}

export function ChannelCard({ channel, videos }: ChannelCardProps) {
  const [sub, setSub] = useState(() => (channel ? isSubscribed(channel.id) : false))

  // Защита от undefined channel
  if (!channel) {
    return null
  }

  return (
    <div className="rounded-lg border border-blue-100 p-4 hover:border-blue-200 transition-colors">
      <div className="flex items-start gap-4">
        <Link to={`/channel/${encodeURIComponent(channel.id || "unknown")}`} className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full overflow-hidden border border-blue-200 bg-blue-50 flex items-center justify-center">
            {channel.avatar ? (
              <img
                src={channel.avatar || "/placeholder.svg"}
                alt={`${channel.username || "Channel"} avatar`}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-sm font-semibold text-blue-700">{getInitials(channel.username)}</span>
            )}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/channel/${encodeURIComponent(channel.id || "unknown")}`}
              className="font-medium hover:text-blue-700 line-clamp-1"
            >
              {channel.username || "Unknown Channel"}
            </Link>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{formatViews(channel.subscriberCount || 0)} подписчиков</span>
            </div>
            <div className="flex items-center gap-1">
              <VideoIcon className="h-3 w-3" />
              <span>{videos.length} видео</span>
            </div>
          </div>

          {channel.bio && <p className="text-sm text-muted-foreground line-clamp-2">{channel.bio}</p>}
        </div>

        <Button
          size="sm"
          variant={sub ? "default" : "outline"}
          className={
            sub ? "bg-blue-600 text-white hover:bg-blue-700" : "border-blue-200 text-blue-700 hover:bg-blue-50"
          }
          onClick={() => setSub(toggleSubscription(channel.id))}
        >
          {sub ? "Подписан" : "Подписаться"}
        </Button>
      </div>
    </div>
  )
}

function getInitials(username?: string): string {
  if (!username || typeof username !== "string") return "CH"

  return (
    username
      .trim()
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CH"
  )
}
