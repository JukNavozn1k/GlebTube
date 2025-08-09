

import { Play } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
  compact?: boolean
}

export function GlebTubeLogo({ className = "", compact = false }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)} aria-label="GlebTube">
      <div className="relative inline-flex items-center justify-center">
        <div className="h-6 w-9 rounded-md bg-blue-600 group-hover:bg-blue-700 transition-colors" />
        <Play className="absolute h-4 w-4 text-white" />
      </div>
      {!compact && (
        <span className="text-lg font-semibold">
          <span className="text-blue-700">Gleb</span>
          <span className="text-gray-900">Tube</span>
        </span>
      )}
    </Link>
  )
}
