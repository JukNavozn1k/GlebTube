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

export function formatTime(t: number): string {
  if (!Number.isFinite(t)) return "0:00"
  const s = Math.floor(t % 60)
  const m = Math.floor((t / 60) % 60)
  const h = Math.floor(t / 3600)
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function formatCommentTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} мин назад`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ч назад`
  const days = Math.floor(hours / 24)
  return `${days} дн назад`
}

export function formatDuration(duration: string | number): string {
  const seconds = typeof duration === "number" ? duration : Number(duration)
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00"

  const totalSeconds = Math.floor(seconds)
  const s = (totalSeconds % 60).toString().padStart(2, "0")
  const m = (Math.floor(totalSeconds / 60) % 60).toString().padStart(2, "0")
  const h = Math.floor(totalSeconds / 3600) % 24
  const d = Math.floor(totalSeconds / 86400)

  if (d > 0) return `${d}:${h.toString().padStart(2, "0")}:${m}:${s}`
  if (h > 0) return `${h}:${m}:${s}`
  return `${Math.floor(totalSeconds / 60)}:${s}`
}
