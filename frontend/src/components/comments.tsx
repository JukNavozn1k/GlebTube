import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Comment } from "@/types/comment"
import { formatCommentTime } from "@/utils/format"
import { useUser } from "@/hooks/use-user"
import { useAuth } from "@/contexts/auth-context"
import { commentUseCases } from "@/use-cases/comment"
import { usePaginatedList } from "@/hooks/use-paginated-list"
// page size is provided by usePaginatedList

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type CommentsProps = {
  video: string
}

type SortOption = "newest" | "oldest" | "popular"

export function Comments({ video }: CommentsProps) {
  const [text, setText] = useState<string>("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<string>("")
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({})
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState<string>("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const { user } = useUser()
  const { auth } = useAuth()

  // Pagination: load comments with ordering; infinite scroll via sentinel skeleton block
  const ordering = sortBy === "popular" ? "-baseStars" : sortBy === "newest" ? "-createdAt" : "createdAt"
  const loadFirst = useCallback(() => commentUseCases.fetchForVideoPaginated(video, { ordering, parent__isnull: true }), [video, ordering])
  const loadNext = useCallback((nextUrl: string) => commentUseCases.fetchNext(nextUrl), [])
  const { items: pagedItems, count, loading, reload, pageSize, hasNext, sentinelRef } = usePaginatedList<Comment>(loadFirst, loadNext)

  // Reset UI state and reload when video or sort changes; guard against StrictMode duplicate for same key
  const lastKeyRef = useRef<string | null>(null)
  useEffect(() => {
    setOpenReplies({})
    setEditingComment(null)
    setEditText("")
    const key = `${video}|${ordering}`
    if (lastKeyRef.current === key) return
    lastKeyRef.current = key
    reload()
  }, [video, ordering, reload])

  // Mirror paginated items into local items for edit/reply mapping logic
  const [items, setItems] = useState<Comment[]>(pagedItems)
  useEffect(() => {
    setItems(pagedItems)
  }, [pagedItems])

  // Create current user object
  const currentUser = useMemo(
    () => ({
      id: user.id || "me",
      username: auth.username || (user as any).name || (user as any).username || "User",
      avatar: user.avatar,
    }),
    [user, auth.username],
  )

  // Normalize current user id as string for comparisons
  const currentUserId = useMemo(() => String(currentUser.id), [currentUser.id])

  const roots = useMemo(() => {
    const rootComments = items.filter((c) => !c.parent)

    // Сортируем корневые комментарии
    switch (sortBy) {
      case "newest":
        return rootComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "oldest":
        return rootComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case "popular":
        return rootComments.sort((a, b) => (b.baseStars || 0) - (a.baseStars || 0))
      default:
        return rootComments
    }
  }, [items, sortBy])

  // Состояние ленивых реплаев по каждому parent
  type RepliesState = {
    items: Comment[]
    next: string | null
    loading: boolean
  }
  const [repliesMap, setRepliesMap] = useState<Record<string, RepliesState>>({})

  // Локальный компонент-сентинел для догрузки реплаев с отображением скелетонов
  function ThreadTailSentinel({ onVisible, active, pageSize }: { onVisible: () => void; active: boolean; pageSize: number }) {
    const [el, setEl] = useState<HTMLDivElement | null>(null)
    useEffect(() => {
      if (!active || !el) return
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            onVisible()
          }
        }
      }, { root: null, rootMargin: "200px", threshold: 0 })
      io.observe(el)
      return () => io.disconnect()
    }, [el, active, onVisible])

    return (
      <div className="grid gap-3">
        {Array.from({ length: Math.max(1, pageSize) }).map((_, i) => (
          i === 0 ? (
            <div key={`reply-tail-sentinel-${i}`} ref={setEl} className="flex items-start gap-3 animate-pulse">
              <div className="h-7 w-7 rounded-full bg-slate-100 border border-blue-100" />
              <div className="flex-1 grid gap-2 min-w-0">
                <div className="h-3 bg-slate-100 rounded w-20" />
                <div className="h-3 bg-slate-100 rounded w-10/12" />
                <div className="h-3 bg-slate-100 rounded w-7/12" />
              </div>
            </div>
          ) : (
            <div key={`reply-tail-skel-${i}`} className="flex items-start gap-3 animate-pulse">
              <div className="h-7 w-7 rounded-full bg-slate-100 border border-blue-100" />
              <div className="flex-1 grid gap-2 min-w-0">
                <div className="h-3 bg-slate-100 rounded w-20" />
                <div className="h-3 bg-slate-100 rounded w-10/12" />
                <div className="h-3 bg-slate-100 rounded w-7/12" />
              </div>
            </div>
          )
        ))}
      </div>
    )
  }

  // Загрузить первую страницу реплаев для parent
  const loadRepliesFirst = useCallback(async (parentId: string) => {
    setRepliesMap((s) => ({ ...s, [parentId]: { items: s[parentId]?.items || [], next: s[parentId]?.next ?? null, loading: true } }))
    try {
      const page = await commentUseCases.fetchForVideoPaginated(video, { ordering: "-createdAt", parent: parentId })
      setRepliesMap((s) => ({
        ...s,
        [parentId]: {
          items: page.results,
          next: page.next || null,
          loading: false,
        },
      }))
    } catch (e) {
      console.error("Failed to load replies:", e)
      setRepliesMap((s) => ({ ...s, [parentId]: { items: s[parentId]?.items || [], next: s[parentId]?.next ?? null, loading: false } }))
    }
  }, [video])

  // Догрузить следующую страницу реплаев
  const loadRepliesNext = useCallback(async (parentId: string) => {
    const state = repliesMap[parentId]
    if (!state?.next || state.loading) return
    setRepliesMap((s) => ({ ...s, [parentId]: { ...s[parentId], loading: true } }))
    try {
      const page = await commentUseCases.fetchNext(state.next)
      setRepliesMap((s) => ({
        ...s,
        [parentId]: {
          items: [...(s[parentId]?.items || []), ...page.results.filter((r) => r.parent === parentId)],
          next: page.next || null,
          loading: false,
        },
      }))
    } catch (e) {
      console.error("Failed to load more replies:", e)
      setRepliesMap((s) => ({ ...s, [parentId]: { ...s[parentId], loading: false } }))
    }
  }, [repliesMap])

  function submitRoot() {
    const val = text.trim()
    if (!val) return
    ;(async () => {
      try {
        await commentUseCases.createComment({ video, text: val })
        setText("")
        // Reload first page to reflect server ordering and counts
        reload()
      } catch (e) {
        console.error("Failed to create comment:", e)
      }
    })()
  }

  function submitReply(parent: string) {
    const val = replyText.trim()
    if (!val) return
    ;(async () => {
      try {
        const created = await commentUseCases.createComment({ video, text: val, parent })
        setReplyText("")
        setReplyTo(null)
        // Открываем ветку
        setOpenReplies((s) => ({ ...s, [parent]: true }))
        // Оптимистично добавляем реплай в ветку
        setRepliesMap((s) => {
          const prev = s[parent]
          const items = prev?.items ? [created, ...prev.items] : [created]
          return {
            ...s,
            [parent]: {
              items,
              next: prev?.next ?? null,
              loading: false,
            },
          }
        })
        // Инкрементируем replyCount у родителя в списке корней
        setItems((prev) => prev.map((c) => (c.id === parent ? { ...c, replyCount: (c.replyCount || 0) + 1 } : c)))
      } catch (e) {
        console.error("Failed to create reply:", e)
      }
    })()
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
    ;(async () => {
      try {
        await commentUseCases.updateComment(commentId, newText)
        setEditingComment(null)
        setEditText("")
        reload()
      } catch (e) {
        console.error("Failed to update comment:", e)
      }
    })()
  }

  function onRemove(id: string) {
    ;(async () => {
      try {
        await commentUseCases.remove(id)
        reload()
      } catch (e) {
        console.error("Failed to delete comment:", e)
      }
    })()
  }

  function onToggleCommentStar(id: string) {
    ;(async () => {
      try {
        const res = await commentUseCases.rate(id)
        setItems((prev) => {
          let found = false
          const next = prev.map((c) => {
            if (c.id !== id) return c
            found = true
            const nextStarred = typeof res?.starred === "boolean" ? res.starred : !c.starred
            const delta = nextStarred === c.starred ? 0 : nextStarred ? 1 : -1
            return { ...c, starred: nextStarred, baseStars: Math.max(0, (c.baseStars || 0) + delta) }
          })
          return found ? next : prev
        })
      } catch (e) {
        console.error("Failed to rate comment:", e)
      }
    })()
  }

  const displayedCount = typeof count === "number" ? count : items.filter((c) => !c.parent).length

  const sortOptions = [
    { value: "newest" as const, label: "Сначала новые", icon: Clock },
    { value: "oldest" as const, label: "Сначала старые", icon: Clock },
    { value: "popular" as const, label: "По популярности", icon: TrendingUp },
  ]

  const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || "Сначала новые"

  return (
    <section className="grid gap-4 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Комментарии ({displayedCount})</h3>

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
          <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.username} />
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
          const rState = repliesMap[c.id]
          const replies = rState?.items || []
          const meRoot = String((c.channel as any).id) === currentUserId
          const isOpen = openReplies[c.id] || false
          const isEditing = editingComment === c.id
          return (
            <div key={c.id} className="flex items-start gap-3 min-w-0">
              <Avatar className="h-9 w-9 border border-blue-200 flex-shrink-0">
                <AvatarImage src={c.channel.avatar || "/placeholder.svg"} alt={c.channel.username} />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
              <div className="grid gap-1 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm flex-wrap min-w-0">
                    <span className="font-medium break-words">{c.channel.username}</span>
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
                        <DropdownMenuItem
                          onClick={() => setCommentToDelete(c.id)}
                          className="text-red-600 focus:text-red-700"
                        >
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
                      {/* Упрощенная кнопка звезды */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 px-2 transition-colors",
                          c.starred
                            ? "text-blue-700 hover:bg-blue-50"
                            : "text-gray-600 hover:bg-gray-100 hover:text-blue-700",
                        )}
                        onClick={() => onToggleCommentStar(c.id)}
                      >
                        <Star className={cn("h-4 w-4 mr-1", c.starred ? "fill-blue-600 text-blue-600" : "")} />
                        <span className="text-xs">{(c.baseStars || 0).toLocaleString("ru-RU")}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-blue-700 hover:bg-blue-50"
                        onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                      >
                        Ответить
                      </Button>

                      {(c.replyCount || 0) > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-blue-700 hover:bg-blue-50"
                          onClick={async () => {
                            const nextOpen = !isOpen
                            setOpenReplies((s) => ({ ...s, [c.id]: nextOpen }))
                            if (nextOpen && (!repliesMap[c.id] || (repliesMap[c.id].items.length === 0 && !repliesMap[c.id].loading))) {
                              await loadRepliesFirst(c.id)
                            }
                          }}
                        >
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 mr-1" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-1" />
                          )}
                          {isOpen ? "Скрыть ответы" : `Показать ответы (${c.replyCount})`}
                        </Button>
                      )}
                    </div>
                  </>
                )}

                {/* Reply editor */}
                {replyTo === c.id && (
                  <div className="mt-2 flex items-start gap-2 min-w-0">
                    <Avatar className="h-7 w-7 border border-blue-200 flex-shrink-0">
                      <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.username} />
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
                {(isOpen && (replies.length > 0 || rState?.loading || rState?.next)) && (
                  <div className="mt-2 pl-10 grid gap-3 min-w-0">
                    {replies.map((r) => {
                      const rMe = String((r.channel as any).id) === currentUserId
                      const rIsEditing = editingComment === r.id
                      return (
                        <div key={r.id} className="flex items-start gap-3 min-w-0">
                          <Avatar className="h-7 w-7 border border-blue-200 flex-shrink-0">
                            <AvatarImage src={r.channel.avatar || "/placeholder.svg"} alt={r.channel.username} />
                            <AvatarFallback>US</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-1 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm flex-wrap min-w-0">
                                <span className="font-medium break-words">{r.channel.username}</span>
                                <span className="text-muted-foreground">• {formatCommentTime(r.createdAt)}</span>
                              </div>

                              {/* Actions Dropdown для реплаев */}
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
                                      onClick={() => setCommentToDelete(r.id)}
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
                                {/* Упрощенная кнопка звезды для реплаев */}
                                <div className="flex flex-wrap gap-2 mt-1 items-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                      "h-8 px-2 transition-colors",
                                      r.starred
                                        ? "text-blue-700 hover:bg-blue-50"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-blue-700",
                                    )}
                                    onClick={() => onToggleCommentStar(r.id)}
                                  >
                                    <Star
                                      className={cn("h-4 w-4 mr-1", r.starred ? "fill-blue-600 text-blue-600" : "")}
                                    />
                                    <span className="text-xs">{(r.baseStars || 0).toLocaleString("ru-RU")}</span>
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {/* Скелетоны + автозапрос следующей страницы через сентинел */}
                    {(rState?.loading || rState?.next) && (
                      <ThreadTailSentinel
                        onVisible={() => loadRepliesNext(c.id)}
                        active={Boolean(rState?.next) && !Boolean(rState?.loading)}
                        pageSize={pageSize}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {roots.length === 0 && !loading && (
          <div className="text-sm text-muted-foreground">Пока нет комментариев. Будьте первым!</div>
        )}
        {loading && (
          <div className="grid gap-4">
            {Array.from({ length: Math.max(1, pageSize) }).map((_, i) => (
              <div key={`comment-initial-skel-${i}`} className="flex items-start gap-3 animate-pulse">
                <div className="h-9 w-9 rounded-full bg-slate-100 border border-blue-100" />
                <div className="flex-1 grid gap-2 min-w-0">
                  <div className="h-3 bg-slate-100 rounded w-24" />
                  <div className="h-3 bg-slate-100 rounded w-11/12" />
                  <div className="h-3 bg-slate-100 rounded w-8/12" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && hasNext && (
          <div className="grid gap-4">
            {Array.from({ length: Math.max(1, pageSize) }).map((_, i) => (
              i === 0 ? (
                <div key={`comment-tail-sentinel-wrap-${i}`} ref={sentinelRef} className="flex items-start gap-3 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-slate-100 border border-blue-100" />
                  <div className="flex-1 grid gap-2 min-w-0">
                    <div className="h-3 bg-slate-100 rounded w-24" />
                    <div className="h-3 bg-slate-100 rounded w-11/12" />
                    <div className="h-3 bg-slate-100 rounded w-8/12" />
                  </div>
                </div>
              ) : (
                <div key={`comment-tail-skel-${i}`} className="flex items-start gap-3 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-slate-100 border border-blue-100" />
                  <div className="flex-1 grid gap-2 min-w-0">
                    <div className="h-3 bg-slate-100 rounded w-24" />
                    <div className="h-3 bg-slate-100 rounded w-11/12" />
                    <div className="h-3 bg-slate-100 rounded w-8/12" />
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!commentToDelete} onOpenChange={() => setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить комментарий?</AlertDialogTitle>
            <AlertDialogDescription>
              Действие необратимо. Комментарий и все ответы к нему будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (commentToDelete) {
                  onRemove(commentToDelete)
                  setCommentToDelete(null)
                }
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}