import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PAGE_SIZE as DEFAULT_PAGE_SIZE } from "@/lib/constants"
import type { Paginated } from "@/types/pagination"

/**
 * Generic infinite-scroll hook for DRF-style paginated endpoints.
 * It loads the first page via loadFirst() and then automatically loads the next page
 * when the user reaches near the bottom of the window.
 */
export function usePaginatedList<T extends { id?: string | number }>(
  loadFirst: () => Promise<Paginated<T>>,
  loadNext: (nextUrl: string) => Promise<Paginated<T>>,
  opts?: { pageSize?: number; keyFn?: (item: T) => string | number }
) {
  const pageSize = opts?.pageSize ?? DEFAULT_PAGE_SIZE
  const keyFn = opts?.keyFn ?? ((item: T) => (item as any)?.id ?? JSON.stringify(item))
  const [items, setItems] = useState<T[]>([])
  const [nextUrl, setNextUrl] = useState<string | null>(null)
  const [count, setCount] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const loadingMoreRef = useRef(false)
  const [loadingMore, setLoadingMore] = useState(false)
  // Guard against duplicate concurrent requests for the same nextUrl
  const inFlightNextUrlRef = useRef<string | null>(null)
  // Guard against fetching the same nextUrl again even after completion (backend returning same URL or rapid triggers)
  const lastLoadedNextUrlRef = useRef<string | null>(null)
  // Keep stable refs to the loader functions to avoid effect dependency thrash
  const loadFirstRef = useRef(loadFirst)
  const loadNextRef = useRef(loadNext)
  useEffect(() => {
    loadFirstRef.current = loadFirst
  }, [loadFirst])
  useEffect(() => {
    loadNextRef.current = loadNext
  }, [loadNext])

  // no external reset; reload() resets state before fetching

  const load = useCallback(async () => {
    // Reset before fetching to reflect loading skeletons in UI
    setItems([])
    setNextUrl(null)
    setCount(undefined)
    setLoading(true)
    inFlightNextUrlRef.current = null
    lastLoadedNextUrlRef.current = null
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
    if (inFlightNextUrlRef.current === nextUrl) return
    if (lastLoadedNextUrlRef.current === nextUrl) return
    loadingMoreRef.current = true
    inFlightNextUrlRef.current = nextUrl
    setLoadingMore(true)
    try {
      const page = await loadNextRef.current(nextUrl)
      setItems((prev) => {
        const seen = new Set(prev.map((it) => String(keyFn(it))))
        const merged: T[] = [...prev]
        for (const it of page.results) {
          const k = String(keyFn(it))
          if (!seen.has(k)) {
            seen.add(k)
            merged.push(it)
          }
        }
        return merged
      })
      setNextUrl(page.next)
      setCount(page.count)
      lastLoadedNextUrlRef.current = nextUrl
    } catch {
      // swallow
    } finally {
      loadingMoreRef.current = false
      setLoadingMore(false)
      // Clear in-flight marker to allow subsequent nextUrl fetches
      inFlightNextUrlRef.current = null
    }
  }, [nextUrl])

  // Note: No auto-load on mount. Callers must call reload() on mount or when inputs change.

  // listen scroll: when near bottom, load next
  useEffect(() => {
    let lastCall = 0
    function onScroll() {
      const now = Date.now()
      if (now - lastCall < 150) return
      lastCall = now
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
    () => ({ items, next: nextUrl, count, loading, loadingMore, reload: load, loadMore, pageSize }),
    [items, nextUrl, count, loading, loadingMore, load, loadMore, pageSize]
  )
}
