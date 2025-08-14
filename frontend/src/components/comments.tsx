

import { useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  addComment,
  getComments,
  removeComment,
  updateComment,
  toggleCommentStar,
  hasStarredComment,
} from "@/utils/storage"
import type { Comment } from "@/types/comment"
import { currentUser } from "@/data/user"
import { formatCommentTime } from "@/utils/format"
import { useUser } from "@/hooks/use-user"
import {
  Star,
  ChevronDown,
  ChevronRight,
  Edit,
  X,
  Check,
  MoreHorizontal,
  Trash2,
  ArrowUpDown,
  Clock,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

type CommentsProps = {
  videoId: string
}

type SortOption = "newest" | "oldest" | "popular"

export function Comments({ videoId }: CommentsProps) {
  const [items, setItems] = useState<Comment[]>([])
  const [text, setText] = useState<string>("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<string>("")
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({})
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState<string>("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const { user } = useUser()

  useEffect(() => {
    setItems(getComments(videoId))
    setReplyTo(null)
    setReplyText("")
    setText("")
    setOpenReplies({})
    setEditingComment(null)
    setEditText("")
  }, [videoId])

  const me = useMemo(() => ({ ...currentUser, avatar: user.avatar }), [user.avatar])

  const roots = useMemo(() => {
    const rootComments = items.filter((c) => !c.parentId)

    // Сортируем корневые комментарии
    switch (sortBy) {
      case "newest":
        return rootComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "oldest":
        return rootComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case "popular":
        return rootComments.sort((a, b) => (b.stars || 0) - (a.stars || 0))
      default:
        return rootComments
    }
  }, [items, sortBy])

  const repliesByParent = useMemo(() => {
    const map = new Map<string, Comment[]>()
    for (const c of items) {
      if (!c.parentId) continue
      if (!map.has(c.parentId)) map.set(c.parentId, [])
      map.get(c.parentId)!.push(c)
    }
    // Ответы всегда сортируем по дате (новые сначала)
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

  function startEdit(comment: Comment) {
    setEditingComment(comment.id)
    setEditText(comment.text)
  }

  function cancelEdit() {
    setEditingComment(null)
    setEditText("")
  }

  function saveEdit(commentId: string) {
    const newText = editText.trim()
    if (!newText) return

    if (updateComment(videoId, commentId, newText)) {
      setItems(getComments(videoId))
      setEditingComment(null)
      setEditText("")
    }
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

  const sortOptions = [
    { value: "newest" as const, label: "Сначала новые", icon: Clock },
    { value: "oldest" as const, label: "Сначала старые", icon: Clock },
    { value: "popular" as const, label: "По популярности", icon: TrendingUp },
  ]

  const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || "Сначала новые"

  return (
    <section className="grid gap-4 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Комментарии ({count})</h3>

        {/* Сортировка - адаптивная для мобильных */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent flex-shrink-0"
            >
              <ArrowUpDown className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{currentSortLabel}</span>
              <span className="sm:hidden">Сорт.</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {sortOptions.map((option) => {
              const Icon = option.icon
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={cn(
                    "flex items-center gap-2",
                    sortBy === option.value && "bg-blue-50 text-blue-700 font-medium",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                  {sortBy === option.value && <div className="ml-auto h-2 w-2 rounded-full bg-blue-600" />}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Create comment */}
      <div className="flex items-start gap-3 min-w-0">
        <Avatar className="h-9 w-9 border border-blue-200 flex-shrink-0">
          <AvatarImage src={me.avatar || "/placeholder.svg"} alt={me.name} />
          <AvatarFallback>GL</AvatarFallback>
        </Avatar>
        <div className="flex-1 grid gap-2 min-w-0">
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
      <div className="grid gap-4 min-w-0">
        {roots.map((c) => {
          const replies = repliesByParent.get(c.id) || []
          const meRoot = c.userId === me.id
          const starred = hasStarredComment(c.id)
          const isOpen = openReplies[c.id] || false
          const isEditing = editingComment === c.id
          return (
            <div key={c.id} className="flex items-start gap-3 min-w-0">
              <Avatar className="h-9 w-9 border border-blue-200 flex-shrink-0">
                <AvatarImage src={c.userAvatar || "/placeholder.svg"} alt={c.userName} />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
              <div className="grid gap-1 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm flex-wrap min-w-0">
                    <span className="font-medium break-words">{c.userName}</span>
                    {c.userHandle ? <span className="text-muted-foreground break-words">{c.userHandle}</span> : null}
                    <span className="text-muted-foreground">• {formatCommentTime(c.createdAt)}</span>
                  </div>

                  {/* Actions Dropdown - только для редактирования и удаления */}
                  {meRoot && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100 flex-shrink-0"
                          aria-label="Действия с комментарием"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[160px]">
                        <DropdownMenuItem onClick={() => startEdit(c)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRemove(c.id)} className="text-red-600 focus:text-red-700">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {isEditing ? (
                  <div className="grid gap-2 mt-1">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-[60px] focus-visible:ring-blue-600"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => saveEdit(c.id)}
                        disabled={!editText.trim()}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Сохранить
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 text-gray-600 hover:bg-gray-100"
                        onClick={cancelEdit}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="text-sm break-words overflow-wrap-anywhere"
                      style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                    >
                      {c.text}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1 items-center">
                      {/* Кнопка звезды вынесена из dropdown */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 px-2 transition-colors",
                          starred
                            ? "text-blue-700 hover:bg-blue-50"
                            : "text-gray-600 hover:bg-gray-100 hover:text-blue-700",
                        )}
                        onClick={() => onToggleCommentStar(c.id)}
                      >
                        <Star className={cn("h-4 w-4 mr-1", starred ? "fill-blue-600 text-blue-600" : "")} />
                        <span className="text-xs">{(c.stars || 0).toLocaleString("ru-RU")}</span>
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
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 mr-1" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-1" />
                          )}
                          {isOpen ? "Скрыть ответы" : `Показать ответы (${replies.length})`}
                        </Button>
                      )}
                    </div>
                  </>
                )}

                {/* Reply editor */}
                {replyTo === c.id && (
                  <div className="mt-2 flex items-start gap-2 min-w-0">
                    <Avatar className="h-7 w-7 border border-blue-200 flex-shrink-0">
                      <AvatarImage src={me.avatar || "/placeholder.svg"} alt={me.name} />
                      <AvatarFallback>GL</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 grid gap-2 min-w-0">
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
                  <div className="mt-2 pl-10 grid gap-3 min-w-0">
                    {replies.map((r) => {
                      const rMe = r.userId === me.id
                      const rStarred = hasStarredComment(r.id)
                      const rIsEditing = editingComment === r.id
                      return (
                        <div key={r.id} className="flex items-start gap-3 min-w-0">
                          <Avatar className="h-7 w-7 border border-blue-200 flex-shrink-0">
                            <AvatarImage src={r.userAvatar || "/placeholder.svg"} alt={r.userName} />
                            <AvatarFallback>US</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-1 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm flex-wrap min-w-0">
                                <span className="font-medium break-words">{r.userName}</span>
                                {r.userHandle ? (
                                  <span className="text-muted-foreground break-words">{r.userHandle}</span>
                                ) : null}
                                <span className="text-muted-foreground">• {formatCommentTime(r.createdAt)}</span>
                              </div>

                              {/* Actions Dropdown для реплаев - только для редактирования и удаления */}
                              {rMe && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100 flex-shrink-0"
                                      aria-label="Действия с ответом"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="min-w-[160px]">
                                    <DropdownMenuItem onClick={() => startEdit(r)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Редактировать
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onRemove(r.id)}
                                      className="text-red-600 focus:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Удалить
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>

                            {rIsEditing ? (
                              <div className="grid gap-2 mt-1">
                                <Textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="min-h-[60px] focus-visible:ring-blue-600"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => saveEdit(r.id)}
                                    disabled={!editText.trim()}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Сохранить
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-3 text-gray-600 hover:bg-gray-100"
                                    onClick={cancelEdit}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Отмена
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div
                                  className="text-sm break-words overflow-wrap-anywhere"
                                  style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                                >
                                  {r.text}
                                </div>
                                {/* Кнопка звезды для реплаев тоже вынесена */}
                                <div className="flex flex-wrap gap-2 mt-1 items-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                      "h-8 px-2 transition-colors",
                                      rStarred
                                        ? "text-blue-700 hover:bg-blue-50"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-blue-700",
                                    )}
                                    onClick={() => onToggleCommentStar(r.id)}
                                  >
                                    <Star
                                      className={cn("h-4 w-4 mr-1", rStarred ? "fill-blue-600 text-blue-600" : "")}
                                    />
                                    <span className="text-xs">{(r.stars || 0).toLocaleString("ru-RU")}</span>
                                  </Button>
                                </div>
                              </>
                            )}
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
