import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Paginated } from "@/types/pagination"

/**
 * Generic infinite-scroll hook for DRF-style paginated endpoints.
 * It loads the first page via loadFirst() and then automatically loads the next page
 * when the user reaches near the bottom of the window.
 */
export function usePaginatedList<T>(
  loadFirst: () => Promise<Paginated<T>>,
  loadNext: (nextUrl: string) => Promise<Paginated<T>>
) {
  const [items, setItems] = useState<T[]>([])
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [count, setCount] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const loadingMoreRef = useRef(false)
  // Keep stable refs to the loader functions to avoid effect dependency thrash
  const loadFirstRef = useRef(loadFirst)
  const loadNextRef = useRef(loadNext)
  useEffect(() => {
    loadFirstRef.current = loadFirst
  }, [loadFirst])
  useEffect(() => {
    loadNextRef.current = loadNext
  }, [loadNext])

  const reset = useCallback(() => {
    setItems([])
    setNextUrl(null)
    setCount(undefined)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const page = await loadFirstRef.current()
      setItems(page.results)
      setNextUrl(page.next)
      setCount(page.count)
    } catch {
      // swallow
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!nextUrl || loadingMoreRef.current) return
    loadingMoreRef.current = true
    try {
      const page = await loadNextRef.current(nextUrl)
      setItems((prev) => [...prev, ...page.results])
      setNextUrl(page.next)
      setCount(page.count)
    } catch {
      // swallow
    } finally {
      loadingMoreRef.current = false
    }
  }, [nextUrl])

  // auto load first page on mount only; callers should invoke reload() if inputs change
  useEffect(() => {
    reset()
    // avoid unhandled rejection
    load().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // listen scroll: when near bottom, load next
  useEffect(() => {
    function onScroll() {
      if (!nextUrl) return
      const threshold = 200 // px from bottom
      const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - threshold
      if (scrolledToBottom) {
        loadMore()
      }
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [nextUrl, loadMore])

  return useMemo(
    () => ({ items, next: nextUrl, count, loading, reload: load, loadMore }),
    [items, nextUrl, count, loading, load, loadMore]
  )
}
