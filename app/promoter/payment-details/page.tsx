"use client"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentDetailsForm } from "@/components/promoter/payment-details-form"
import { Button } from "@/components/ui/button"
import { fetchPromoterProfile } from "@/lib/promoter/authSlice"
import { fetchSeasons } from "@/lib/seasonSlice"
import { removePaymentDetails } from "@/lib/promoter/paymentSlice"
import { Trash2 } from "lucide-react"
import type { AppDispatch, RootState } from "@/lib/store"

export default function PaymentDetailsPage() {
  const dispatch = useDispatch<AppDispatch>()
  
  const { details: paymentDetails } = useSelector((state: RootState) => state.payment)
  const { currentSeason } = useSelector((state: RootState) => state.season)

  useEffect(() => {
    if (!currentSeason) {
      dispatch(fetchSeasons())
      return
    }
    // Profile fetch includes payment details populate in store via authSlice -> payment reducer if coupled?
    // Wait, the existing code uses fetchPromoterProfile or fetchPaymentDetails?
    // The previous wallet code just relied on the payment state which might be populated elsewhere or by auth profile fetch.
    dispatch(fetchPromoterProfile(currentSeason._id))
  }, [dispatch, currentSeason])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Payment Details</h1>
          <p className="text-muted-foreground">Manage your payout account information</p>
        </div>
        <div className="flex gap-2 items-center">
          {paymentDetails && (
            <Button variant="destructive" size="sm" onClick={() => {
              if (confirm("Are you sure you want to remove your payment details?")) {
                dispatch(removePaymentDetails())
              }
            }}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
          <PaymentDetailsForm />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Bank Details</CardTitle>
          <CardDescription>
            {paymentDetails 
              ? "Your registered bank account for withdrawals." 
              : "You haven't added any payment details yet. Click the button above to add them."}
          </CardDescription>
        </CardHeader>
        {paymentDetails && (
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Holder</p>
                <p className="text-lg">{paymentDetails.accHolderName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
                <p className="text-lg">{paymentDetails.bankName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                <p className="text-lg font-mono">****{paymentDetails.accNo.slice(-4)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">IFSC Code</p>
                <p className="text-lg font-mono">{paymentDetails.ifscCode}</p>
              </div>
              {paymentDetails.upiId && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">UPI ID</p>
                  <p className="text-lg font-mono">{paymentDetails.upiId}</p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
