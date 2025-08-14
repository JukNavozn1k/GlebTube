"use client"

import { useEffect, useState, useCallback } from "react"

type AuthState = {
  loggedIn: boolean
  name: string
}

const AUTH_KEY = "glebtube:auth"

const DEFAULT_AUTH: AuthState = {
  loggedIn: true, // стартуем как «вошедший», чтобы не ломать текущий UX
  name: "Gleb",
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(DEFAULT_AUTH)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem(AUTH_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AuthState
        setAuth({
          loggedIn: !!parsed.loggedIn,
          name: parsed.name || DEFAULT_AUTH.name,
        })
      } else {
        localStorage.setItem(AUTH_KEY, JSON.stringify(DEFAULT_AUTH))
      }
    } catch {
      // ignore
    }
  }, [])

  const login = useCallback((name: string) => {
    const next: AuthState = { loggedIn: true, name: name.trim() || "User" }
    setAuth(next)
    if (typeof window !== "undefined") localStorage.setItem(AUTH_KEY, JSON.stringify(next))
  }, [])

  const register = useCallback((name: string) => {
    // Заглушка: ведём себя как login
    const next: AuthState = { loggedIn: true, name: name.trim() || "User" }
    setAuth(next)
    if (typeof window !== "undefined") localStorage.setItem(AUTH_KEY, JSON.stringify(next))
  }, [])

  const logout = useCallback(() => {
    const next: AuthState = { loggedIn: false, name: "" }
    setAuth(next)
    if (typeof window !== "undefined") localStorage.setItem(AUTH_KEY, JSON.stringify(next))
  }, [])

  return { auth, login, register, logout }
}
