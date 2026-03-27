"use client"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { fetchWithdrawals } from "@/lib/promoter/withdrawalSlice"
import { fetchSeasons } from "@/lib/seasonSlice"
import { fetchPromoterProfile } from "@/lib/promoter/authSlice"
import { WithdrawalRequestForm } from "@/components/promoter/withdrawal-request-form"
import { SeasonSwitcher } from "@/components/promoter/season-switcher"
import { Info } from "lucide-react"
import { useState } from "react"
import type { AppDispatch, RootState } from "@/lib/store"

export default function WithdrawalsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { withdrawals, isLoading } = useSelector((state: RootState) => state.withdrawal)
  const { currentSeason } = useSelector((state: RootState) => state.season)
  
  const [isWithdrawalFormOpen, setIsWithdrawalFormOpen] = useState(false)
  const hasPendingWithdrawal = withdrawals.some((w) => w.status === "pending")

  useEffect(() => {
    if (!currentSeason) {
      dispatch(fetchSeasons())
      return
    }
    
    dispatch(fetchPromoterProfile(currentSeason._id))

    if (user?.status === "approved") {
      dispatch(fetchWithdrawals())
    }
  }, [dispatch, user?.status, currentSeason])

  if (user?.status !== "approved") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Withdrawals</h1>
            <p className="text-muted-foreground">Track your withdrawal requests</p>
          </div>
          <SeasonSwitcher />
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="ml-2">
            Not active this season. Contact admin.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default"
      case "Processing":
        return "secondary"
      case "Rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Withdrawals</h1>
          <p className="text-muted-foreground">Track your withdrawal requests and history</p>
        </div>
        <div className="flex items-center gap-2">
          <SeasonSwitcher />
          <WithdrawalRequestForm
            hasPendingWithdrawal={hasPendingWithdrawal}
            open={isWithdrawalFormOpen}
            onOpenChange={setIsWithdrawalFormOpen}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>All your withdrawal requests and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No withdrawal requests found. Make your first withdrawal request.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested Date</TableHead>
                    {/* <TableHead>Processed Date</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal._id}>
                      <TableCell className="font-semibold text-primary">
                        ₹{withdrawal.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(withdrawal.status)}>{withdrawal.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(withdrawal.createdAt).toLocaleDateString()}</TableCell>
                      {/* <TableCell>
                        {withdrawal.status === "approved" ? new Date(withdrawal.date).toLocaleDateString() : "-"}
                      </TableCell> */}
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
