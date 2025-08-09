import {Link} from "react-router-dom"
import { formatViews, timeAgo, type Video } from "@/lib/glebtube-data"

type VideoCardProps = {
  video: Video
  showChannelAvatar?: boolean
}

function channelSlug(name: string) {
  return encodeURIComponent(name.toLowerCase())
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <div className="group rounded-lg border border-blue-100 bg-white hover:shadow-sm transition-shadow">
      <Link to={`/watch/${video.id}`} className="block relative overflow-hidden rounded-t-lg">
        <div className="relative aspect-video bg-blue-50">
          <img
            src={video.thumbnail || "/placeholder.svg?height=720&width=1280&query=blue%20white%20video%20thumbnail"}
            alt={`Thumbnail ${video.title}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-xs">
            {video.duration}
          </div>
        </div>
      </Link>

      <div className="flex gap-3 p-3">
        {/* decorative avatar placeholder for alignment */}
        <div className="h-9 w-9 rounded-full bg-blue-100 border border-blue-200 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <Link
            to={`/watch/${video.id}`}
            className="line-clamp-2 font-medium hover:text-blue-700 min-h-[2.5rem]"
            title={video.title}
          >
            {video.title}
          </Link>
          <div className="mt-0.5 text-xs text-muted-foreground">
            <Link to={`/channel/${channelSlug(video.channel)}`} className="hover:text-blue-700">
              {video.channel}
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
