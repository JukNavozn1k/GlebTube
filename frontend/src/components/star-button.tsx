
import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { videoUseCases } from "@/use-cases/video"

type StarButtonProps = {
  video: string
  baseCount?: number
  showCount?: boolean
  size?: "default" | "sm" | "lg"
  className?: string,
  starred: boolean,
}

export function StarButton({
  video,
  baseCount = 0,
  showCount = true,
  size = "default",
  className = "",
  starred = false,
}: StarButtonProps) {
  const [isStarred, setisStarred] = useState<boolean>(starred)

  const handleToggle = async () => {
    try {
      const res = await videoUseCases.rate(video)
      setisStarred(res.starred)
    } catch (e) {
      console.error("Failed to rate video:", e)
    }
  }

  const count =  baseCount + (isStarred ? 1 : 0)

  return (
    <div className={className}>
      <Button
        type="button"
        size={size}
        variant={isStarred ? "default" : "outline"}
        aria-pressed={isStarred}
        aria-label={isStarred ? "Убрать звезду" : "Поставить звезду"}
        className={
          isStarred ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-blue-200 text-blue-700 hover:bg-blue-50"
        }
        onClick={handleToggle}
      >
        <Star className={isStarred ? "h-4 w-4 fill-white" : "h-4 w-4 text-blue-700"} />
        {showCount && <span className="ml-2 text-sm">{count.toLocaleString("ru-RU")}</span>}
      </Button>
    </div>
  )
}

