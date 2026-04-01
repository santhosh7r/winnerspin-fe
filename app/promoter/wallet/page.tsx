"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, CreditCard, TrendingUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PaymentDetailsForm } from "@/components/promoter/payment-details-form"
import { WithdrawalRequestForm } from "@/components/promoter/withdrawal-request-form"
import { fetchEarnings } from "@/lib/promoter/walletSlice"
import { fetchWithdrawals } from "@/lib/promoter/withdrawalSlice"
import { fetchSeasons } from "@/lib/seasonSlice"
import { fetchPromoterProfile } from "@/lib/promoter/authSlice"
import type { AppDispatch, RootState } from "@/lib/store"

export default function WalletPage() {
  const dispatch = useDispatch<AppDispatch>()
  const searchParams = useSearchParams()
  const [isWithdrawalFormOpen, setIsWithdrawalFormOpen] = useState(false)

  const { user } = useSelector((state: RootState) => state.auth)
  const { earnings, transactions, isLoading } = useSelector((state: RootState) => state.wallet)
  const { details: paymentDetails } = useSelector((state: RootState) => state.payment)
  const { withdrawals, isLoading: isWithdrawalsLoading } = useSelector((state: RootState) => state.withdrawal)
  const { currentSeason } = useSelector((state: RootState) => state.season)
  const hasPendingWithdrawal = withdrawals.some((w) => w.status === "pending")

  useEffect(() => {
    if (searchParams.get("action") === "withdraw") {
      setIsWithdrawalFormOpen(true)
    }
  }, [searchParams])

  useEffect(() => {
    // First, ensure we have season data. If not, fetch it and wait.
    if (!currentSeason) {
      dispatch(fetchSeasons())
      return
    }

    // Once we have a season, fetch the promoter profile if we don't have it.
    if (!user && currentSeason?._id) {
      dispatch(fetchPromoterProfile(currentSeason._id))
    }

    // Once the user is approved and we have a season, fetch wallet data.
    if (user?.status === "approved" && currentSeason?._id) {
      dispatch(fetchEarnings())
      dispatch(fetchWithdrawals())
    }
  }, [dispatch, user, currentSeason])

  if (user?.status !== "approved") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Earnings</h1>
          <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
        </div>

        <Alert>
          <AlertDescription>
            Your account is not approved for the current season. Wallet features are only available for approved
            promoters.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Earnings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage your earnings and withdrawals</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PaymentDetailsForm />
          <WithdrawalRequestForm
            hasPendingWithdrawal={hasPendingWithdrawal}
            open={isWithdrawalFormOpen}
            onOpenChange={setIsWithdrawalFormOpen}
          />
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground truncate">Balance</CardTitle>
            <Wallet className="h-3 w-3 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {isLoading ? "..." : `₹${earnings.toLocaleString()}`}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground truncate">Bank Details</CardTitle>
            <CreditCard className="h-3 w-3 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-base sm:text-2xl font-bold text-primary">{paymentDetails ? "Setup" : "Pending"}</div>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground truncate">Account Status</CardTitle>
            <TrendingUp className="h-3 w-3 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-base sm:text-2xl font-bold text-primary">Approved</div>
          </CardContent>
        </Card>
      </div>

      {/* Earning History */}
      <Card className="border-0 sm:border shadow-none sm:shadow-sm">
        <CardHeader className="px-0 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Earning History</CardTitle>
          <CardDescription className="text-xs">Your commission history for the current season.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-xs">No earnings recorded for this season yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full no-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Customer ID</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell className="whitespace-nowrap text-xs">{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs">{transaction.customer}</TableCell>
                      <TableCell className="whitespace-nowrap text-right font-semibold text-green-600 text-xs">+ ₹{transaction.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card className="border-0 sm:border shadow-none sm:shadow-sm">
        <CardHeader className="px-0 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Withdrawal History</CardTitle>
          <CardDescription className="text-xs">All your withdrawal requests and their current status</CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {isWithdrawalsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-xs">No withdrawal requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full no-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Amount</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Requested Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal._id}>
                      <TableCell className="whitespace-nowrap font-semibold text-primary text-xs">
                        ₹{withdrawal.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={withdrawal.status === 'approved' ? 'default' : withdrawal.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[10px]">
                            {withdrawal.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-xs">{new Date(withdrawal.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
