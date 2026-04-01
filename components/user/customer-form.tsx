"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useDispatch, useSelector } from "react-redux"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus } from "lucide-react"
import { createCustomer, fetchCustomers } from "@/lib/user/customerSlice"
import type { AppDispatch, RootState } from "@/lib/store"

const getInitialFormData = (seasonAmount?: number) => ({
  username: "",
  email: "",
  cardNo: "",
  mobile: "",
  state: "",
  city: "",
  address: "",
  pincode: "",
  firstPayment: seasonAmount?.toString() || "",
  paymentDate: new Date().toISOString().split("T")[0],
})
interface CustomerFormProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}
export const CustomerForm = ({ open, onOpenChange }: CustomerFormProps) => {
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    cardNo: "",
    mobile: "",
    state: "",
    city: "",
    address: "",
    pincode: "",
    firstPayment: "",
    paymentDate: ""
  })
  
  const dispatch = useDispatch<AppDispatch>()
  const { currentSeason } = useSelector((state: RootState) => state.season)
  const { isLoading, error } = useSelector((state: RootState) => state.customer)

  useEffect(() => {
    if (open && currentSeason) {
      setFormData((prev) => ({
        ...prev, // Keep any user-entered data if dialog is re-opened
        ...getInitialFormData(currentSeason.amount),
      }))
    }
  }, [open, currentSeason])

  useEffect(() => {
    // Clear form-specific errors when the dialog is closed or when the redux error changes
    if (!open || error) {
      setFormError(null)
    }
  }, [open, error])

  useEffect(() => {
    const fetchPincodeData = async () => {
      if (formData.pincode.length === 6) {
        try {
          const response = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
          const data = await response.json();
          if (data && data[0].Status === "Success" && data[0].PostOffice.length > 0) {
            const { District, State } = data[0].PostOffice[0];
            if (formError === "Invalid pincode.") {
              setFormError(null);
            }
            setFormData(prev => ({ ...prev, city: District, state: State }));
          } else {
            setFormError("Invalid pincode.");
            setFormData(prev => ({ ...prev, city: "", state: "" }));
          }
        } catch (err) {
          console.error("Failed to fetch pincode data", err);
          setFormError("Failed to fetch pincode data.");
        }
      }
    };
    fetchPincodeData();
  }, [formError, formData.pincode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSeason) {
      return
    }
    if (!/^[a-zA-Z\s]{4,}$/.test(formData.username)) {
      setFormError("Customer Name must be at least 4 characters long and contain only letters and spaces.")
      return
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      setFormError("Mobile number must be 10 digits.")
      return
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      setFormError("Pincode must be 6 digits.")
      return
    }
    if (!formData.state) {
      setFormError("Please select a state.")
      return
    }
    try {
      await dispatch(
        createCustomer({
          ...formData,
          firstPayment: Number(formData.firstPayment),
          status: "approved",
          seasonId: currentSeason._id,
        }),
      ).unwrap()

      // Reset form and close dialog
      setFormData(getInitialFormData(currentSeason?.amount))
      setFormError(null)
      onOpenChange?.(false)

      // Refresh customers list
      if (currentSeason) dispatch(fetchCustomers(currentSeason._id))
    } catch (error) {
      // Error handled by Redux
      console.error("Error creating customer:", error);
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 w-full sm:w-auto h-11 sm:h-10">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>Create a new customer for the current season: {currentSeason?.season}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || formError) && (
            <Alert variant="destructive">
              <AlertDescription>{error || formError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Customer Name</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Enter customer name"
                pattern="[a-zA-Z\s]+"
                title="Customer name can only contain letters and spaces."
                minLength={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Card Number</Label>
              <Input
                id="cardNo"
                type="text"
                value={formData.cardNo}
                onChange={(e) => handleInputChange("cardNo", e.target.value)}
                placeholder="WS0001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
                placeholder="Enter mobile number"
                pattern="\d{10}"
                title="Mobile number must be 10 digits"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter full address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange("pincode", e.target.value)}
                placeholder="Enter pincode"
                pattern="\d{6}"
                title="Pincode must be 6 digits"
                required
                maxLength={6}
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Enter city"
                readOnly
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                readOnly
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstPayment">First Payment</Label>
              <Input
                id="firstPayment"
                type="number"
                value={formData.firstPayment}
                onChange={(e) => handleInputChange("firstPayment", e.target.value)}
                placeholder={`Default: ₹${currentSeason?.amount || 0}`}
                readOnly={!!currentSeason?.amount}
                className={currentSeason?.amount ? "bg-muted" : ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleInputChange("paymentDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Customer"}
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
