import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"
import type { AuthState } from "@/types/user"

const AUTH_KEY = "glebtube:auth"

const DEFAULT_AUTH: AuthState = {
  loggedIn: false,
  name: "",
}

type AuthContextType = {
  auth: AuthState
  login: (name: string) => void
  register: (name: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(DEFAULT_AUTH)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const raw = localStorage.getItem(AUTH_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AuthState
        setAuth({
          loggedIn: !!parsed.loggedIn,
          name: parsed.name || "",
        })
      }
    } catch {
      // ignore parsing errors
    } finally {
      setIsInitialized(true)
    }
  }, [])

  const login = useCallback((name: string) => {
    const next: AuthState = { loggedIn: true, name: name.trim() || "User" }
    setAuth(next)
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, JSON.stringify(next))
    }
  }, [])

  const register = useCallback((name: string) => {
    const next: AuthState = { loggedIn: true, name: name.trim() || "User" }
    setAuth(next)
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, JSON.stringify(next))
    }
  }, [])

  const logout = useCallback(() => {
    const next: AuthState = { loggedIn: false, name: "" }
    setAuth(next)
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, JSON.stringify(next))
    }
  }, [])

  // Не рендерим детей пока не инициализировались
  if (!isInitialized) {
    return null
  }

  return (
    <AuthContext.Provider value={{ auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
