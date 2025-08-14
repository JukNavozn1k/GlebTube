

import { useEffect, useMemo, useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isStarred, toggleStar } from "@/lib/glebtube-storage"

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
  const [active, setActive] = useState<boolean>(false)

  useEffect(() => {
    setActive(isStarred(videoId))
  }, [videoId])

  const count = useMemo(() => baseCount + (active ? 1 : 0), [baseCount, active])

  return (
    <div className={className}>
      <Button
        type="button"
        size={size}
        variant={active ? "default" : "outline"}
        aria-pressed={active}
        aria-label={active ? "Убрать звезду" : "Поставить звезду"}
        className={
          active ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-blue-200 text-blue-700 hover:bg-blue-50"
        }
        onClick={() => setActive(toggleStar(videoId))}
      >
        <Star className={active ? "h-4 w-4 fill-white" : "h-4 w-4 text-blue-700"} />
        {showCount && <span className="ml-2 text-sm">{count.toLocaleString("ru-RU")}</span>}
      </Button>
    </div>
  )
}
