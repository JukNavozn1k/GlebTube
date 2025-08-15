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
export function getComments(videoId: string): Comment[] {
  if (typeof window === "undefined") return []
  const comments = safeParse<any[]>(localStorage.getItem(COMMENTS_PREFIX + videoId), [])

  // Migrate old comment format to new format
  return comments.map((comment) => {
    if (comment.user && typeof comment.starred === "boolean") {
      // Already in new format
      return comment as Comment
    } else {
      // Migrate from old format
      return {
        id: comment.id,
        videoId: comment.videoId,
        parentId: comment.parentId,
        user:
          comment.user ||
          ({
            id: comment.userId || "unknown",
            name: comment.userName || "Unknown User",
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

export function addComment(videoId: string, text: string, user: User, parentId?: string): Comment {
  const c: Comment = {
    id: `${videoId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    videoId,
    parentId,
    user,
    text,
    createdAt: new Date().toISOString(),
    stars: 0,
    starred: false,
  }
  const list = getComments(videoId)
  list.unshift(c)
  localStorage.setItem(COMMENTS_PREFIX + videoId, JSON.stringify(list))
  return c
}

export function updateComment(videoId: string, commentId: string, newText: string): boolean {
  if (typeof window === "undefined") return false
  const list = getComments(videoId)
  const idx = list.findIndex((c) => c.id === commentId)
  if (idx === -1) return false

  list[idx].text = newText
  localStorage.setItem(COMMENTS_PREFIX + videoId, JSON.stringify(list))
  return true
}

export function removeComment(videoId: string, commentId: string) {
  // remove the comment and its direct replies
  const list = getComments(videoId).filter((c) => c.id !== commentId && c.parentId !== commentId)
  localStorage.setItem(COMMENTS_PREFIX + videoId, JSON.stringify(list))
}

/* Simplified comment rating system */
export function toggleCommentStar(videoId: string, commentId: string): boolean {
  if (typeof window === "undefined") return false
  const list = getComments(videoId)
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

  localStorage.setItem(COMMENTS_PREFIX + videoId, JSON.stringify(list))
  return comment.starred
}

/* History: array of { id, at } sorted by latest */
export function addHistory(videoId: string) {
  if (typeof window === "undefined") return
  const list = safeParse<{ id: string; at: string }[]>(localStorage.getItem(HISTORY_KEY), [])
  const filtered = list.filter((x) => x.id !== videoId)
  filtered.unshift({ id: videoId, at: new Date().toISOString() })
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
export function toggleVideoStar(videoId: string): boolean {
  if (typeof window === "undefined") return false

  // For built-in videos, we'll store starred state separately
  const starredVideos = safeParse<string[]>(localStorage.getItem("glebtube:starred-videos"), [])
  const isCurrentlyStarred = starredVideos.includes(videoId)

  if (isCurrentlyStarred) {
    const filtered = starredVideos.filter((id) => id !== videoId)
    localStorage.setItem("glebtube:starred-videos", JSON.stringify(filtered))
    return false
  } else {
    starredVideos.push(videoId)
    localStorage.setItem("glebtube:starred-videos", JSON.stringify(starredVideos))
    return true
  }
}

export function isVideoStarred(videoId: string): boolean {
  if (typeof window === "undefined") return false
  const starredVideos = safeParse<string[]>(localStorage.getItem("glebtube:starred-videos"), [])
  return starredVideos.includes(videoId)
}

export function getStarredVideoIds(): string[] {
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
