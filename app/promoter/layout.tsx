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
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

export default function PromoterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()
  const { token, user } = useSelector((state: RootState) => state.auth)
  const { currentSeason, hasFetched, seasons } = useSelector((state: RootState) => state.season)

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

  // Show a loading screen for the entire layout until the season is determined
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
      <div className="overflow-y-auto overscroll-none min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:pl-64">
          {/* Top Bar Area */}
          <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-4">
                 <div className="lg:hidden w-10"></div> {/* Spacer for mobile menu button */}
                 <h2 className="text-lg font-semibold hidden sm:block">Season</h2>
                 <SeasonSwitcher />
              </div>
              <div className="flex items-center gap-4">
                {/* Additional header items could go here */}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 pb-20 lg:pb-6">{children}</main>
        </div>
        <MobileNav />
      </div>
    </ThemeProvider>
  )
}
