
import {Link} from "react-router-dom"
import { formatViews, timeAgo } from "@/utils/format"
import type { Video } from "@/types/video"

type VideoCardProps = {
  video: Video
  showChannelAvatar?: boolean
}

function channelSlug(channelId: string) {
  return encodeURIComponent(channelId)
}

function getInitials(name?: string): string {
  if (!name || typeof name !== "string") return "CH"

  return (
    name
      .trim()
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CH"
  )
}

export function VideoCard({ video, showChannelAvatar = true }: VideoCardProps) {
  // Защита от undefined channel
  if (!video?.channel) {
    return null
  }

  return (
    <div className="group rounded-lg border border-blue-100 bg-white hover:shadow-sm transition-shadow">
      <Link to={`/watch/${video.id}`} className="block relative overflow-hidden rounded-t-lg">
        <div className="relative aspect-video bg-blue-50">
          <img
            src={video.thumbnail || "/placeholder.svg?height=720&width=1280&query=blue%20white%20video%20thumbnail"}
            alt={`Thumbnail ${video.title}`}
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover"
          />
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-xs">
            {video.duration}
          </div>
        </div>
      </Link>

      <div className="flex gap-3 p-3">
        {showChannelAvatar && (
          <Link to={`/channel/${channelSlug(video.channel.id || "unknown")}`} className="flex-shrink-0">
            <div className="h-9 w-9 rounded-full overflow-hidden border border-blue-200 bg-blue-50 flex items-center justify-center">
              {video.channel.avatar ? (
                <img
                  src={video.channel.avatar || "/placeholder.svg"}
                  alt={`${video.channel.name || "Channel"} avatar`}
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-xs font-semibold text-blue-700">{getInitials(video.channel.name)}</span>
              )}
            </div>
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <Link
            to={`/watch/${video.id}`}
            className="line-clamp-2 font-medium hover:text-blue-700 min-h-[2.5rem]"
            title={video.title}
          >
            {video.title}
          </Link>
          <div className="mt-0.5 text-xs text-muted-foreground">
            <Link to={`/channel/${channelSlug(video.channel.id || "unknown")}`} className="hover:text-blue-700">
              <span>{video.channel.name || "Unknown Channel"}</span>
            </Link>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatViews(video.views)} просмотров • {timeAgo(video.createdAt)}
          </div>
        </div>
      </div>
    </div>
  )
}
