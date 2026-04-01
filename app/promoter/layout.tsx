"use client"

import { MobileNav } from "@/components/promoter/mobile-nav"
import { SeasonSwitcher } from "@/components/promoter/season-switcher"
import { Sidebar } from "@/components/promoter/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { fetchPromoterProfile } from "@/lib/promoter/authSlice"
import { fetchSeasons } from "@/lib/seasonSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { usePathname, useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { cn } from "@/lib/utils"

export default function PromoterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()
  const { token, user } = useSelector((state: RootState) => state.auth)
  const { currentSeason, hasFetched, seasons } = useSelector((state: RootState) => state.season)

  // Sync collapsed state with local storage
  useEffect(() => {
    const saved = localStorage.getItem("promoter-sidebar-collapsed")
    if (saved !== null) setIsSidebarCollapsed(saved === "true")
  }, [])

  const toggleSidebarCollapse = () => {
    const next = !isSidebarCollapsed
    setIsSidebarCollapsed(next)
    localStorage.setItem("promoter-sidebar-collapsed", String(next))
  }

  useEffect(() => {
    if (!token && pathname !== "/promoter/login") {
      router.push("/promoter/login")
      return
    }

    if (token && pathname !== "/promoter/login") {
      if (!hasFetched) {
        dispatch(fetchSeasons())
      } else if (currentSeason && !user) {
        dispatch(fetchPromoterProfile(currentSeason._id))
      }
    }

    if (token && pathname === "/promoter/login") {
      router.push("/promoter/dashboard")
    }
  }, [token, user, pathname, router, dispatch, currentSeason, hasFetched])

  if (!token && pathname !== "/promoter/login") {
    return null
  }

  if (token && !hasFetched && pathname !== "/promoter/login") {
    return <div className="flex h-screen items-center justify-center">Loading season data...</div>
  }

  if (pathname === "/promoter/login") {
    return <>{children}</>
  }

  if (token && hasFetched && seasons.length === 0 && !currentSeason) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">No Active Seasons</h2>
          <p className="text-muted-foreground">You have not been activated for any season yet. Please contact the administrator.</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background flex relative max-w-full overflow-x-hidden">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          toggleCollapse={toggleSidebarCollapse} 
        />
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 min-w-0 max-w-full overflow-hidden mt-16 lg:mt-0",
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}>
          {/* Top Bar - Desktop Only */}
          <header className="hidden lg:flex sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur items-center h-16 transition-all duration-300">
            <div className="flex items-center justify-between px-6 w-full">
              <div className="flex items-center gap-4">
                 <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <h2 className="text-sm font-bold text-primary uppercase tracking-tight">Promoter Panel</h2>
                    <span className="text-[10px] text-muted-foreground">|</span>
                    <h2 className="text-xs font-semibold text-muted-foreground">Season View</h2>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                <SeasonSwitcher />
              </div>
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-6 pb-24 lg:pb-6 min-w-0 max-w-full">{children}</main>
        </div>
        <MobileNav />
      </div>
    </ThemeProvider>
  )
}