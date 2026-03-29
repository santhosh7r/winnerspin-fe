"use client"
import { SeasonSwitcher } from "@/components/promoter/season-switcher"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchPromoterProfile } from "@/lib/promoter/authSlice"
import { fetchEarnings } from "@/lib/promoter/walletSlice"
import { fetchSeasons } from "@/lib/seasonSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Wallet, Lock } from "lucide-react"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

export default function EarningsPage() {
  const dispatch = useDispatch<AppDispatch>()

  const { earnings, transactions, isLoading, error } = useSelector((state: RootState) => state.wallet)
  const { currentSeason } = useSelector((state: RootState) => state.season)

  // Use currentSeason to fetch profile to update status, and then fetch earnings
  useEffect(() => {
    if (!currentSeason) {
      dispatch(fetchSeasons())
      return
    }

    dispatch(fetchPromoterProfile(currentSeason._id))
    dispatch(fetchEarnings())
  }, [dispatch, currentSeason])


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Earnings</h1>
          <p className="text-muted-foreground">Manage your earnings for {currentSeason?.season}</p>
        </div>
        <div className="flex gap-2">
          <SeasonSwitcher />
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="ml-2">
            {error}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-card-foreground">
            <CardTitle className="text-sm font-medium text-card-foreground">Season Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {isLoading ? "Loading..." : `₹${earnings.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">Available to withdraw</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earning History</CardTitle>
          <CardDescription>Your commission history for the current season.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No earnings recorded for this season yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer ID</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono text-xs">{transaction.customer}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">+ ₹{transaction.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </>
      )}
    </div>
  )
}
