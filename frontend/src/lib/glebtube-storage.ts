"use client"

import type { User } from "@/types/user"
import type { UploadedVideo } from "@/types/video"
import type { Comment } from "@/types/comment"
import { getChannelByName } from "@/data/channels"

const STAR_KEY = "glebtube:stars"
const COMMENTS_PREFIX = "glebtube:comments:"
const COMMENT_STARS_KEY = "glebtube:comment-stars"
const HISTORY_KEY = "glebtube:history"
const UPLOADS_KEY = "glebtube:uploads"
const SUBS_KEY = "glebtube:subs"

function safeParse<T>(val: string | null, fallback: T): T {
  try {
    return val ? (JSON.parse(val) as T) : fallback
  } catch {
    return fallback
  }
}

/* Video stars (1-star toggle per video) */
export function getStarred(): string[] {
  if (typeof window === "undefined") return []
  return safeParse(localStorage.getItem(STAR_KEY), [])
}

export function isStarred(video: string): boolean {
  return getStarred().includes(video)
}

export function toggleStar(video: string): boolean {
  if (typeof window === "undefined") return false
  const set = new Set(getStarred())
  if (set.has(video)) set.delete(video)
  else set.add(video)
  const arr = Array.from(set)
  localStorage.setItem(STAR_KEY, JSON.stringify(arr))
  return arr.includes(video)
}

/* Comments with replies */
export function getComments(video: string): Comment[] {
  if (typeof window === "undefined") return []
  return safeParse(localStorage.getItem(COMMENTS_PREFIX + video), [])
}

export function addComment(video: string, text: string, user: User, parent?: string): Comment {
  const c: Comment = {
    id: `${video}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    video,
    parent,
    userId: user.id,
    userName: user.username,
    userHandle: user.handle,
    userAvatar: user.avatar,
    text,
    createdAt: new Date().toISOString(),
    stars: 0,
  }
  const list = getComments(video)
  list.unshift(c)
  localStorage.setItem(COMMENTS_PREFIX + video, JSON.stringify(list))
  return c
}

export function updateComment(video: string, commentId: string, newText: string): boolean {
  if (typeof window === "undefined") return false
  const list = getComments(video)
  const idx = list.findIndex((c) => c.id === commentId)
  if (idx === -1) return false

  list[idx].text = newText
  localStorage.setItem(COMMENTS_PREFIX + video, JSON.stringify(list))
  return true
}

export function removeComment(video: string, commentId: string) {
  // remove the comment and its direct replies
  const list = getComments(video).filter((c) => c.id !== commentId && c.parent !== commentId)
  localStorage.setItem(COMMENTS_PREFIX + video, JSON.stringify(list))
}

/* Comment stars (per-user 1-star) */
function getMyCommentStars(): string[] {
  if (typeof window === "undefined") return []
  return safeParse(localStorage.getItem(COMMENT_STARS_KEY), [])
}

export function hasStarredComment(commentId: string): boolean {
  return getMyCommentStars().includes(commentId)
}

export function toggleCommentStar(video: string, commentId: string): boolean {
  if (typeof window === "undefined") return false
  const mine = new Set(getMyCommentStars())
  const list = getComments(video)
  const idx = list.findIndex((c) => c.id === commentId)
  if (idx === -1) return hasStarredComment(commentId)

  const currently = mine.has(commentId)
  if (currently) {
    mine.delete(commentId)
    list[idx].stars = Math.max(0, (list[idx].stars || 0) - 1)
  } else {
    mine.add(commentId)
    list[idx].stars = (list[idx].stars || 0) + 1
  }
  localStorage.setItem(COMMENT_STARS_KEY, JSON.stringify(Array.from(mine)))
  localStorage.setItem(COMMENTS_PREFIX + video, JSON.stringify(list))
  return !currently
}

/* History: array of { id, at } sorted by latest */
export function addHistory(video: string) {
  if (typeof window === "undefined") return
  const list = safeParse<{ id: string; at: string }[]>(localStorage.getItem(HISTORY_KEY), [])
  const filtered = list.filter((x) => x.id !== video)
  filtered.unshift({ id: video, at: new Date().toISOString() })
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, 200)))
}

export function getHistory(): { id: string; at: string }[] {
  if (typeof window === "undefined") return []
  return safeParse(localStorage.getItem(HISTORY_KEY), [])
}

export function clearHistory() {
  if (typeof window === "undefined") return
  localStorage.removeItem(HISTORY_KEY)
}

/* Uploads */
export function getUploads(): UploadedVideo[] {
  if (typeof window === "undefined") return []
  const uploads = safeParse<any[]>(localStorage.getItem(UPLOADS_KEY), [])

  // Ensure all uploads have proper channel objects
  return uploads.map((upload) => ({
    ...upload,
    channel: typeof upload.channel === "string" ? getChannelByName(upload.channel) : upload.channel,
  }))
}

export function addUpload(
  v: Omit<UploadedVideo, "id" | "views" | "createdAt" | "baseStars" | "isUploaded">,
): UploadedVideo {
  const id = `upl-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
  const item: UploadedVideo = {
    ...v,
    id,
    views: 0,
    createdAt: new Date().toISOString(),
    baseStars: 0,
    isUploaded: true,
    channel: typeof v.channel === "string" ? getChannelByName(v.channel) : v.channel,
  }
  const list = getUploads()
  list.unshift(item)
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(list))
  return item
}

export function updateUpload(
  id: string,
  patch: Partial<Pick<UploadedVideo, "title" | "description" | "thumbnail">>,
): UploadedVideo | null {
  const list = getUploads()
  const idx = list.findIndex((x) => x.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...patch }
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(list))
  return list[idx]
}

export function deleteUpload(id: string) {
  const list = getUploads().filter((x) => x.id !== id)
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(list))
}

/* Subscriptions: store channel names for backward compatibility */
export function getSubscriptions(): string[] {
  if (typeof window === "undefined") return []
  return safeParse(localStorage.getItem(SUBS_KEY), [])
}

export function isSubscribed(channel: string): boolean {
  return getSubscriptions().includes(channel)
}

export function toggleSubscription(channel: string): boolean {
  if (typeof window === "undefined") return false
  const set = new Set(getSubscriptions())
  if (set.has(channel)) set.delete(channel)
  else set.add(channel)
  const arr = Array.from(set)
  localStorage.setItem(SUBS_KEY, JSON.stringify(arr))
  return arr.includes(channel)
}

export { HISTORY_KEY } // in case it's useful elsewhere
