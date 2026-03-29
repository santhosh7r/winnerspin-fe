"use client"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { User, Mail, MapPin, CreditCard, Edit, Save, X, KeyRound } from "lucide-react"
// You will need to create this `changePromoterPassword` thunk in your authSlice
// It should take { currentPassword, newPassword } and make a PUT request to `/api/promoter/change-password`
import { fetchPromoterProfile, logout, updatePromoterProfile, changePromoterPassword } from "@/lib/promoter/authSlice"
import { fetchRepayments } from "@/lib/promoter/repaymentSlice"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchSeasons } from "@/lib/seasonSlice"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    mobNo: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)

  const [isFetchingPincode, setIsFetchingPincode] = useState(false)
  const { currentSeason } = useSelector((state: RootState) => state.season)
  const dispatch = useDispatch<AppDispatch>()
  const { user, error: authError } = useSelector((state: RootState) => state.auth)
  const { repayments } = useSelector((state: RootState) => state.repayment)

  useEffect(() => {
    if (currentSeason) {
      dispatch(fetchPromoterProfile(currentSeason._id))
      dispatch(fetchRepayments(currentSeason._id))
    } else {
      dispatch(fetchSeasons())
    }
  }, [dispatch, currentSeason])

  useEffect(() => {
    const fetchPincodeData = async () => {
      if (editData.pincode.length === 6) {
        setIsFetchingPincode(true)
        setFormError(null)
        try {
          const response = await fetch(`https://api.postalpincode.in/pincode/${editData.pincode}`)
          const data = await response.json()
          if (data && data[0].Status === "Success" && data[0].PostOffice.length > 0) {
            const { District, State } = data[0].PostOffice[0]
            setEditData((prev) => ({ ...prev, city: District, state: State }))
          } else {
            setFormError("Invalid pincode.")
            setEditData((prev) => ({ ...prev, city: "", state: "" }))
          }
        } catch (err) {
          console.error("Failed to fetch pincode data", err)
          setFormError("Failed to fetch pincode data.")
        } finally {
          setIsFetchingPincode(false)
        }
      }
    }
    if (isEditing) {
      fetchPincodeData()
    }
  }, [editData.pincode, isEditing])

  const handleEdit = () => {
    if (user) {
      setFormError(null)
      setEditData({
        username: user.username,
        email: user.email,
        mobNo: user.mobNo,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
      })
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    setFormError(null)
    if (!/^\d{10}$/.test(editData.mobNo)) {
      setFormError("Mobile number must be 10 digits.")
      return
    }
    if (!/^\d{6}$/.test(editData.pincode)) {
      setFormError("Pincode must be 6 digits.")
      return
    }
    if (!editData.state || !editData.city) {
      setFormError("City and State are required. Please enter a valid pincode.")
      return
    }
    try {
      await dispatch(updatePromoterProfile(editData)).unwrap()
      setIsEditing(false)
    } catch (err) {
      // Error is handled by the slice and displayed in the form4
      console.error("Error updating profile:", err)
      setFormError("Error updating profile. Please try again.")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({
      username: "",
      email: "",
      mobNo: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    })
    setFormError(null)
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const handlePasswordDialogOpenChange = (open: boolean) => {
    setIsPasswordDialogOpen(open)
    // If the dialog is being closed, reset its state
    if (!open) {
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setPasswordError(null)
      setPasswordSuccess(null)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError(null)
    setPasswordSuccess(null)

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("All fields are required.")
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.")
      return
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.")
      return
    }

    try {
      await dispatch(changePromoterPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })).unwrap()
      setPasswordSuccess("Password changed successfully!")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      // Close the dialog after a short delay to show the success message
      setTimeout(() => {
        handlePasswordDialogOpenChange(false)
      }, 1500)
    } catch (err) {
      if(err instanceof Error) setPasswordError(err.message);
      else setPasswordError("Failed to change password. Please check your current password.")
    }
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={handleEdit} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel} className="gap-2 bg-transparent">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {(authError || formError) && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{authError || formError}</AlertDescription>
        </Alert>
      )}

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={isEditing ? editData.username : user.username}
                readOnly
                className="text-lg font-semibold border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div>
              <Label>User ID</Label>
              <p className="text-lg font-mono">{user.userid}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Your contact and personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              ) : (
                <p className="text-lg pt-2">{user.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              {isEditing ? (
                <Input
                  id="mobile"
                  value={editData.mobNo}
                  onChange={(e) => setEditData({ ...editData, mobNo: e.target.value })}
                />
              ) : (
                <p className="text-lg pt-2">{user.mobNo}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
          <CardDescription>Your residential address details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            {isEditing ? (
              <Input
                id="address"
                value={editData.address}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              />
            ) : (
              <p className="text-lg pt-2">{user.address || "-"}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              {isEditing ? (
                <Input
                  id="pincode"
                  value={editData.pincode}
                  onChange={(e) => setEditData({ ...editData, pincode: e.target.value })}
                  maxLength={6}
                  placeholder="Enter 6-digit pincode"
                />
              ) : (
                <p className="text-lg pt-2">{user.pincode || "-"}</p>
              )}
              {isEditing && isFetchingPincode && <p className="text-xs text-muted-foreground">Fetching details...</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              {isEditing ? (
                <Input
                  id="city"
                  value={editData.city}
                  readOnly
                  className="bg-muted"
                />
              ) : (
                <p className="text-lg pt-2">{user.city || "-"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              {isEditing ? (
                <Input
                  id="state"
                  value={editData.state}
                  readOnly
                  className="bg-muted"
                />
              ) : (
                <p className="text-lg pt-2">{user.state || "-"}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Account Statistics
          </CardTitle>
          <CardDescription>Your account performance and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold text-primary">{repayments.length || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold text-primary">₹{user.balance?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Account Created</p>
              <p className="text-lg">Recently</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account settings and security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Dialog open={isPasswordDialogOpen} onOpenChange={handlePasswordDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <KeyRound className="h-4 w-4" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>Enter your current and new password. Click save when you&apos;re done.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {passwordError && (
                      <Alert variant="destructive"><AlertDescription>{passwordError}</AlertDescription></Alert>
                    )}
                    {passwordSuccess && (
                      <Alert><AlertDescription>{passwordSuccess}</AlertDescription></Alert>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="currentPassword" className="text-right">
                        Current
                      </Label>
                      <Input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="newPassword" className="text-right">
                        New
                      </Label>
                      <Input id="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="confirmPassword" className="text-right">
                        Confirm
                      </Label>
                      <Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Close
                      </Button>
                    </DialogClose>
                    <Button type="button" onClick={handlePasswordChange} disabled={!!passwordSuccess}>
                      Save changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button className="bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20 hover:text-destructive transition-colors justify-center" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
