import { useState, useEffect } from "react"
import { useLocation, Outlet } from "react-router-dom"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AuthProvider } from "@/contexts/auth-context"

export function ClientLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()
  const pathname = location.pathname

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const marginLeft = !isMobile ? sidebarWidth : 0
  const isAuthPage = pathname === "/auth"

  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        {!isAuthPage && (
          <Sidebar
            onWidthChange={setSidebarWidth}
            onCollapseChange={setSidebarCollapsed}
          />
        )}
        <div
          className="flex-1 transition-all duration-300"
          style={{
            marginLeft: isAuthPage ? 0 : marginLeft,
          }}
        >
          {!isAuthPage && <Header sidebarCollapsed={sidebarCollapsed} />}
          <div className={isAuthPage ? "min-h-screen" : "pt-10 min-h-screen"}>
            <Outlet />
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}
