import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"
import type { AuthState } from "@/types/user"
import type { LoginCredentials, RegisterCredentials } from "@/types/auth"
import { AuthUseCase } from "@/use-cases/auth-use-case"
import { useRef } from "react"

const DEFAULT_AUTH: AuthState = {
  loggedIn: false,
  name: "",
}

type AuthContextType = {
  auth: AuthState
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(DEFAULT_AUTH)
  const [isInitialized, setIsInitialized] = useState(false)

  const useCaseRef = useRef<AuthUseCase | null>(null)

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        useCaseRef.current = new AuthUseCase()
        await useCaseRef.current.initialize()
        const user = useCaseRef.current.getCurrentUser()
        if (!mounted) return
        if (user) {
          setAuth({ loggedIn: true, name: user.username })
        } else {
          setAuth(DEFAULT_AUTH)
        }
      } catch {
        if (!mounted) return
        setAuth(DEFAULT_AUTH)
      } finally {
        if (!mounted) return
        setIsInitialized(true)
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    if (!useCaseRef.current) throw new Error('Auth provider not initialized')
    await useCaseRef.current.login(credentials)
    const user = useCaseRef.current.getCurrentUser()
    setAuth({ loggedIn: true, name: user?.username || "User" })
  }, [])

  const register = useCallback(async (credentials: RegisterCredentials) => {
    if (!useCaseRef.current) throw new Error('Auth provider not initialized')
    await useCaseRef.current.register(credentials)
    const user = useCaseRef.current.getCurrentUser()
    setAuth({ loggedIn: true, name: user?.username || "User" })
  }, [])

  const logout = useCallback(() => {
    useCaseRef.current?.logout()
    setAuth(DEFAULT_AUTH)
  }, [])

  if (!isInitialized) return null

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
