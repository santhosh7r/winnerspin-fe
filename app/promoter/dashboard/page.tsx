"use client"
import { differenceInMonths } from "date-fns"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SeasonSwitcher } from "@/components/promoter/season-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { StatsCards } from "@/components/promoter/stats-cards"
import { NewPosterPopup } from "@/components/promoter/new-poster-popup"
import { useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { fetchSeasons } from "@/lib/seasonSlice"
import { fetchRepayments } from "@/lib/promoter/repaymentSlice"
import { fetchMyNetwork } from "@/lib/promoter/networkSlice"

export default function PromoterDashboard() {
  const { currentSeason } = useSelector((state: RootState) => state.season)

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (!currentSeason) dispatch(fetchSeasons());
    else {
      // Fetch all dashboard stats data
      dispatch(fetchRepayments(currentSeason._id));
      dispatch(fetchMyNetwork(currentSeason._id));
    }
  }, [currentSeason, dispatch])
  const { user } = useSelector((state: RootState) => state.auth)

  const getSeasonDuration = () => {
    if (!currentSeason) return ""

    const start = new Date(currentSeason.startDate)
    const end = new Date(currentSeason.endDate)

    // Calculate the difference in months and add 1 to make it inclusive
    const durationInMonths = differenceInMonths(end, start) + 1

    return `${durationInMonths} Month${durationInMonths > 1 ? "s" : ""}`
  }

  return (
    <div className="space-y-6">
      <NewPosterPopup audience="promoter" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.username}</p>
        </div>
        <div className="flex items-center gap-2">
          <SeasonSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {/* Current Season Info */}
      {currentSeason && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Season</CardTitle>
            <CardDescription>Active season information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Season</p>
                <p className="text-lg font-semibold text-primary">{currentSeason.season}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className="text-lg font-semibold text-primary">₹{currentSeason.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Duration
                </p>
                <p className="text-lg font-semibold text-primary">{getSeasonDuration()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <StatsCards />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/promoter/customers?action=add">
              <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <h3 className="font-medium text-primary mb-2">Add New Customer</h3>
                <p className="text-sm text-muted-foreground">Register a new customer for the current season</p>
              </div>
            </Link>
            <Link href="/promoter/repayments?action=add">
              <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <h3 className="font-medium text-primary mb-2">Record Repayment</h3>
                <p className="text-sm text-muted-foreground">Add a repayment for existing customers</p>
              </div>
            </Link>
            {user?.status === "approved" && (
              <Link href="/promoter/wallet?action=withdraw">
                <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <h3 className="font-medium text-primary mb-2">Request Withdrawal</h3>
                  <p className="text-sm text-muted-foreground">Withdraw your available earnings</p>
                </div>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
