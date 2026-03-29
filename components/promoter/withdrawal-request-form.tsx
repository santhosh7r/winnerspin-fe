"use client"
import type React from "react"
import { useEffect, useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchPromoterProfile } from "@/lib/promoter/authSlice"
import { fetchEarnings } from "@/lib/promoter/walletSlice"
import { fetchWithdrawals, requestWithdrawal } from "@/lib/promoter/withdrawalSlice"
import { fetchSeasons } from "@/lib/seasonSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { ArrowDownToLine } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"

interface WithdrawalRequestFormProps {
  hasPendingWithdrawal: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function WithdrawalRequestForm({ hasPendingWithdrawal, open, onOpenChange }: WithdrawalRequestFormProps) {
  const [amount, setAmount] = useState("")

  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { details: paymentDetails } = useSelector((state: RootState) => state.payment)
  const { isLoading, error } = useSelector((state: RootState) => state.withdrawal)
  const { currentSeason } = useSelector((state: RootState) => state.season)

  useEffect(() => {
    if (!currentSeason) {
      dispatch(fetchSeasons())
    }
  }, [dispatch, currentSeason])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paymentDetails) {
      return
    }

    const withdrawalAmount = Number(amount)
    const availableBalance = user?.balance || 0
    if (withdrawalAmount > availableBalance || withdrawalAmount < 500) {
      return
    }

    try {
      if(!currentSeason) return;
      await dispatch(requestWithdrawal({ amount: withdrawalAmount, seasonId: currentSeason._id })).unwrap()
      setAmount("")
      onOpenChange?.(false)
      // Refresh earnings
      dispatch(fetchEarnings())
      dispatch(fetchWithdrawals())
      dispatch(fetchPromoterProfile(currentSeason._id))
    } catch (error) {
      // Error handled by Redux
      console.error("Error requesting withdrawal:", error)
    }
  }

  if (!paymentDetails || hasPendingWithdrawal) {
    const buttonText = hasPendingWithdrawal ? "Pending Request Exists" : "Add Payment Details First";
    return (
      <Button disabled={true} className="gap-2">
        <ArrowDownToLine className="h-4 w-4" />
        {buttonText}
      </Button>
    )
  }

  const availableBalance = user?.balance || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={hasPendingWithdrawal}>
          <ArrowDownToLine className="h-4 w-4" />
          {hasPendingWithdrawal ? "Pending Request Exists" : "Request Withdrawal"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Withdrawal</DialogTitle>
          <DialogDescription>Withdraw your available earnings to your bank account</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold text-primary">₹{availableBalance.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount (Min ₹500)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to withdraw (min 500)"
              max={availableBalance}
              min="500"
              required
            />
            {Number(amount) > availableBalance && (
              <p className="text-sm text-destructive">Amount cannot exceed available balance</p>
            )}
            {Number(amount) > 0 && Number(amount) < 500 && (
              <p className="text-sm text-destructive">Minimum withdrawal amount is ₹500</p>
            )}
          </div>

          <div className="p-4 bg-card border rounded-lg">
            <p className="text-sm font-medium mb-2">Withdrawal will be sent to:</p>
            <p className="text-sm text-muted-foreground">{paymentDetails.accHolderName}</p>
            <p className="text-sm text-muted-foreground">{paymentDetails.bankName}</p>
            <p className="text-sm text-muted-foreground">****{paymentDetails.accNo.slice(-4)}</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading || Number(amount) > availableBalance || Number(amount) < 500 || !amount}>
              {isLoading ? "Processing..." : "Request Withdrawal"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
