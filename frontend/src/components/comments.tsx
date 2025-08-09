

import { useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  addComment,
  getComments,
  removeComment,
  toggleCommentStar,
  hasStarredComment,
  type Comment,
} from "@/lib/glebtube-storage"
import { currentUser } from "@/lib/glebtube-user"
import { Star, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"

type CommentsProps = {
  videoId: string
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} мин назад`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ч назад`
  const days = Math.floor(hours / 24)
  return `${days} дн назад`
}

export function Comments({ videoId }: CommentsProps) {
  const [items, setItems] = useState<Comment[]>([])
  const [text, setText] = useState<string>("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<string>("")
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({})
  const { user } = useUser()

  useEffect(() => {
    setItems(getComments(videoId))
    setReplyTo(null)
    setReplyText("")
    setText("")
    setOpenReplies({})
  }, [videoId])

  const me = useMemo(() => ({ ...currentUser, avatar: user.avatar }), [user.avatar])

  const roots = useMemo(() => items.filter((c) => !c.parentId), [items])
  const repliesByParent = useMemo(() => {
    const map = new Map<string, Comment[]>()
    for (const c of items) {
      if (!c.parentId) continue
      if (!map.has(c.parentId)) map.set(c.parentId, [])
      map.get(c.parentId)!.push(c)
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return map
  }, [items])

  function submitRoot() {
    const val = text.trim()
    if (!val) return
    const c = addComment(videoId, val, me)
    setItems((prev) => [c, ...prev])
    setText("")
  }

  function submitReply(parentId: string) {
    const val = replyText.trim()
    if (!val) return
    const c = addComment(videoId, val, me, parentId)
    setItems((prev) => [c, ...prev])
    setReplyText("")
    setReplyTo(null)
    setOpenReplies((s) => ({ ...s, [parentId]: true }))
  }

  function onRemove(id: string) {
    removeComment(videoId, id)
    setItems((prev) => prev.filter((c) => c.id !== id && c.parentId !== id))
  }

  function onToggleCommentStar(id: string) {
    toggleCommentStar(videoId, id)
    setItems(getComments(videoId))
  }

  const count = items.filter((c) => !c.parentId).length

  return (
    <section className="grid gap-4">
      <h3 className="text-lg font-semibold">Комментарии ({count})</h3>

      {/* Create comment */}
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 border border-blue-200">
          <AvatarImage src={me.avatar || "/placeholder.svg"} alt={me.name} />
          <AvatarFallback>GL</AvatarFallback>
        </Avatar>
        <div className="flex-1 grid gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Оставьте комментарий"
            className="min-h-[72px] focus-visible:ring-blue-600"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              className="border-blue-200 text-blue-700 bg-transparent"
              onClick={() => setText("")}
            >
              Отмена
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={submitRoot} disabled={!text.trim()}>
              Отправить
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* List */}
      <div className="grid gap-4">
        {roots.map((c) => {
          const replies = repliesByParent.get(c.id) || []
          const meRoot = c.userId === me.id
          const starred = hasStarredComment(c.id)
          const isOpen = openReplies[c.id] || false
          return (
            <div key={c.id} className="flex items-start gap-3">
              <Avatar className="h-9 w-9 border border-blue-200">
                <AvatarImage src={c.userAvatar || "/placeholder.svg"} alt={c.userName} />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
              <div className="grid gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{c.userName}</span>
                  {c.userHandle ? <span className="text-muted-foreground">{c.userHandle}</span> : null}
                  <span className="text-muted-foreground">• {formatTime(c.createdAt)}</span>
                </div>
                <div className="text-sm whitespace-pre-wrap break-words">{c.text}</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Button
                    variant={starred ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-8 px-2",
                      starred ? "bg-blue-600 text-white hover:bg-blue-700" : "text-blue-700 hover:bg-blue-50",
                    )}
                    onClick={() => onToggleCommentStar(c.id)}
                    aria-pressed={starred}
                  >
                    <Star className={cn("h-4 w-4", starred ? "fill-white" : "text-blue-700")} />
                    <span className="ml-1 text-xs">{(c.stars || 0).toLocaleString("ru-RU")}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-blue-700 hover:bg-blue-50"
                    onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                  >
                    Ответить
                  </Button>
                  {replies.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-blue-700 hover:bg-blue-50"
                      onClick={() => setOpenReplies((s) => ({ ...s, [c.id]: !isOpen }))}
                    >
                      {isOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                      {isOpen ? "Скрыть ответы" : `Показать ответы (${replies.length})`}
                    </Button>
                  )}
                  {meRoot && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-blue-700 hover:bg-blue-50"
                      onClick={() => onRemove(c.id)}
                    >
                      Удалить
                    </Button>
                  )}
                </div>

                {/* Reply editor */}
                {replyTo === c.id && (
                  <div className="mt-2 flex items-start gap-2">
                    <Avatar className="h-7 w-7 border border-blue-200">
                      <AvatarImage src={me.avatar || "/placeholder.svg"} alt={me.name} />
                      <AvatarFallback>GL</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 grid gap-2">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Ваш ответ"
                        className="min-h-[56px] focus-visible:ring-blue-600"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          className="border-blue-200 text-blue-700 bg-transparent"
                          onClick={() => {
                            setReplyText("")
                            setReplyTo(null)
                          }}
                        >
                          Отмена
                        </Button>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => submitReply(c.id)}
                          disabled={!replyText.trim()}
                        >
                          Ответить
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {replies.length > 0 && isOpen && (
                  <div className="mt-2 pl-10 grid gap-3">
                    {replies.map((r) => {
                      const rMe = r.userId === me.id
                      const rStarred = hasStarredComment(r.id)
                      return (
                        <div key={r.id} className="flex items-start gap-3">
                          <Avatar className="h-7 w-7 border border-blue-200">
                            <AvatarImage src={r.userAvatar || "/placeholder.svg"} alt={r.userName} />
                            <AvatarFallback>US</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">{r.userName}</span>
                              {r.userHandle ? <span className="text-muted-foreground">{r.userHandle}</span> : null}
                              <span className="text-muted-foreground">• {formatTime(r.createdAt)}</span>
                            </div>
                            <div className="text-sm whitespace-pre-wrap break-words">{r.text}</div>
                            <div className="flex gap-2 mt-1">
                              <Button
                                variant={rStarred ? "default" : "ghost"}
                                size="sm"
                                className={cn(
                                  "h-8 px-2",
                                  rStarred
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "text-blue-700 hover:bg-blue-50",
                                )}
                                onClick={() => onToggleCommentStar(r.id)}
                                aria-pressed={rStarred}
                              >
                                <Star className={cn("h-4 w-4", rStarred ? "fill-white" : "text-blue-700")} />
                                <span className="ml-1 text-xs">{(r.stars || 0).toLocaleString("ru-RU")}</span>
                              </Button>
                              {rMe && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-blue-700 hover:bg-blue-50"
                                  onClick={() => onRemove(r.id)}
                                >
                                  Удалить
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {roots.length === 0 && (
          <div className="text-sm text-muted-foreground">Пока нет комментариев. Будьте первым!</div>
        )}
      </div>
    </section>
  )
}
