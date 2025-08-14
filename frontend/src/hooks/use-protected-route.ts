import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"

export function useProtectedRoute(redirectPath?: string) {
  const { auth } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth.loggedIn) {
      const returnUrl = encodeURIComponent(redirectPath || window.location.pathname + window.location.search)
      navigate(`/auth?returnUrl=${returnUrl}`)
    }
  }, [auth.loggedIn, navigate, redirectPath])

  return auth.loggedIn
}
