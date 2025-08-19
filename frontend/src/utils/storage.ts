"use client"

import type { User } from "@/types/user"
import type { UploadedVideo } from "@/types/video"
import type { Comment } from "@/types/comment"
import { getChannelByName } from "@/data/channels"

const COMMENTS_PREFIX = "glebtube:comments:"
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

/* Comments with simplified rating system */
export function getComments(video: string): Comment[] {
  if (typeof window === "undefined") return []
  const comments = safeParse<any[]>(localStorage.getItem(COMMENTS_PREFIX + video), [])

  // Migrate old comment format to new format
  return comments.map((comment) => {
    if (comment.user && typeof comment.starred === "boolean") {
      // Already in new format
      return comment as Comment
    } else {
      // Migrate from old format
      return {
        id: comment.id,
        video: comment.video,
        parent: comment.parent,
        user:
          comment.user ||
          ({
            id: comment.userId || "unknown",
            username: comment.userName || "Unknown User",
            avatar: comment.userAvatar,
          } as User),
        text: comment.text,
        createdAt: comment.createdAt,
        stars: comment.stars || 0,
        starred: false, // Default value for migrated comments
      } as Comment
    }
  })
}

export function addComment(video: string, text: string, user: User, parent?: string): Comment {
  const c: Comment = {
    id: `${video}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    video,
    parent,
    user,
    text,
    createdAt: new Date().toISOString(),
    stars: 0,
    starred: false,
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

/* Simplified comment rating system */
export function toggleCommentStar(video: string, commentId: string): boolean {
  if (typeof window === "undefined") return false
  const list = getComments(video)
  const idx = list.findIndex((c) => c.id === commentId)
  if (idx === -1) return false

  const comment = list[idx]
  const wasStarred = comment.starred

  // Toggle starred state
  comment.starred = !wasStarred

  // Update stars count
  if (comment.starred) {
    comment.stars = (comment.stars || 0) + 1
  } else {
    comment.stars = Math.max(0, (comment.stars || 0) - 1)
  }

  localStorage.setItem(COMMENTS_PREFIX + video, JSON.stringify(list))
  return comment.starred
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

/* Uploads with simplified rating */
export function getUploads(): UploadedVideo[] {
  if (typeof window === "undefined") return []
  const uploads = safeParse<any[]>(localStorage.getItem(UPLOADS_KEY), [])

  // Ensure all uploads have proper channel objects and starred field
  return uploads.map((upload) => ({
    ...upload,
    channel: typeof upload.channel === "string" ? getChannelByName(upload.channel) : upload.channel,
    starred: upload.starred ?? false, // Default to false if not set
  }))
}

export function addUpload(
  v: Omit<UploadedVideo, "id" | "views" | "createdAt" | "baseStars" | "isUploaded" | "starred">,
): UploadedVideo {
  const id = `upl-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
  const item: UploadedVideo = {
    ...v,
    id,
    views: 0,
    createdAt: new Date().toISOString(),
    baseStars: 0,
    starred: false,
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

/* Simplified video rating system */
export function toggleVideoStar(video: string): boolean {
  if (typeof window === "undefined") return false

  // For built-in videos, we'll store starred state separately
  const starredVideos = safeParse<string[]>(localStorage.getItem("glebtube:starred-videos"), [])
  const isCurrentlyStarred = starredVideos.includes(video)

  if (isCurrentlyStarred) {
    const filtered = starredVideos.filter((id) => id !== video)
    localStorage.setItem("glebtube:starred-videos", JSON.stringify(filtered))
    return false
  } else {
    starredVideos.push(video)
    localStorage.setItem("glebtube:starred-videos", JSON.stringify(starredVideos))
    return true
  }
}

export function isVideoStarred(video: string): boolean {
  if (typeof window === "undefined") return false
  const starredVideos = safeParse<string[]>(localStorage.getItem("glebtube:starred-videos"), [])
  return starredVideos.includes(video)
}

export function getStarredvideos(): string[] {
  if (typeof window === "undefined") return []
  return safeParse<string[]>(localStorage.getItem("glebtube:starred-videos"), [])
}

/* Subscriptions: store channel IDs */
export function getSubscriptions(): string[] {
  if (typeof window === "undefined") return []
  return safeParse(localStorage.getItem(SUBS_KEY), [])
}

export function isSubscribed(channelId: string): boolean {
  return getSubscriptions().includes(channelId)
}

export function toggleSubscription(channelId: string): boolean {
  if (typeof window === "undefined") return false
  const set = new Set(getSubscriptions())
  if (set.has(channelId)) set.delete(channelId)
  else set.add(channelId)
  const arr = Array.from(set)
  localStorage.setItem(SUBS_KEY, JSON.stringify(arr))
  return arr.includes(channelId)
}

export { HISTORY_KEY } // in case it's useful elsewhere

/* Simplified subscription system */
export function getSubscribedChannelIds(): string[] {
  if (typeof window === "undefined") return []
  return safeParse(localStorage.getItem(SUBS_KEY), [])
}


export function toggleChannelSubscription(channelId: string): boolean {
  if (typeof window === "undefined") return false
  const subscribedIds = new Set(getSubscribedChannelIds())

  if (subscribedIds.has(channelId)) {
    subscribedIds.delete(channelId)
  } else {
    subscribedIds.add(channelId)
  }

  const arr = Array.from(subscribedIds)
  localStorage.setItem(SUBS_KEY, JSON.stringify(arr))
  return arr.includes(channelId)
}

/* Video starring system using starred field */
export function updateVideoStarred(video: string, starred: boolean): void {
  if (typeof window === "undefined") return

  // Update in uploads
  const uploads = getUploads()
  const uploadIndex = uploads.findIndex((v) => v.id === video)
  if (uploadIndex !== -1) {
    uploads[uploadIndex].starred = starred
    localStorage.setItem(UPLOADS_KEY, JSON.stringify(uploads))
  }

  // For built-in videos, store starred state separately since we can't modify the original data
  const builtinStars = safeParse<Record<string, boolean>>(localStorage.getItem("glebtube:builtin-stars"), {})
  builtinStars[video] = starred
  localStorage.setItem("glebtube:builtin-stars", JSON.stringify(builtinStars))
}

export function getVideoStarred(video: string): boolean {
  if (typeof window === "undefined") return false

  // Check uploads first
  const uploads = getUploads()
  const upload = uploads.find((v) => v.id === video)
  if (upload) {
    return upload.starred
  }

  // Check built-in videos starred state
  const builtinStars = safeParse<Record<string, boolean>>(localStorage.getItem("glebtube:builtin-stars"), {})
  return builtinStars[video] || false
}

export function toggleVideoStarred(video: string): boolean {
  const currentStarred = getVideoStarred(video)
  const newStarred = !currentStarred
  updateVideoStarred(video, newStarred)
  return newStarred
}