import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isVideoStarred, toggleVideoStar } from "@/utils/storage"

type StarButtonProps = {
  videoId: string
  baseCount?: number
  showCount?: boolean
  size?: "default" | "sm" | "lg"
  className?: string
}

export function StarButton({
  videoId,
  baseCount = 0,
  showCount = true,
  size = "default",
  className = "",
}: StarButtonProps) {
  const [starred, setStarred] = useState<boolean>(false)

  useEffect(() => {
    setStarred(isVideoStarred(videoId))
  }, [videoId])

  const handleToggle = () => {
    const newStarred = toggleVideoStar(videoId)
    setStarred(newStarred)
  }

  const count = baseCount + (starred ? 1 : 0)

  return (
    <div className={className}>
      <Button
        type="button"
        size={size}
        variant={starred ? "default" : "outline"}
        aria-pressed={starred}
        aria-label={starred ? "Убрать звезду" : "Поставить звезду"}
        className={
          starred ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-blue-200 text-blue-700 hover:bg-blue-50"
        }
        onClick={handleToggle}
      >
        <Star className={starred ? "h-4 w-4 fill-white" : "h-4 w-4 text-blue-700"} />
        {showCount && <span className="ml-2 text-sm">{count.toLocaleString("ru-RU")}</span>}
      </Button>
    </div>
  )
}
