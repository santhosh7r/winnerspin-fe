"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createPromoter } from "@/lib/promoter/networkSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { Check, Copy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"

export default function CreatePromoterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobNo: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  })
  const [createdInfo, setCreatedInfo] = useState<{userid: string, defaultPassword: string, username: string} | null>(null)
  const [copied, setCopied] = useState(false)
  
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { isLoading, error } = useSelector((state: RootState) => state.network)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatedInfo(null)
    setCopied(false)
    
    try {
      const res = await dispatch(createPromoter(formData)).unwrap()
      if (res && res.promoter) {
        setCreatedInfo({
          userid: res.promoter.userid,
          defaultPassword: res.promoter.defaultPassword,
          username: res.promoter.username
        })
        setFormData({
          username: "",
          email: "",
          mobNo: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
        })
      }
    } catch {
      // Error is handled by Redux state
    }
  }

  const handleCopy = () => {
    if (createdInfo) {
      navigator.clipboard.writeText(`User ID: ${createdInfo.userid}\nPassword: ${createdInfo.defaultPassword}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-primary">Create Promoter</h1>
        <p className="text-muted-foreground">Recruit and register a new sub-promoter</p>
      </div>

      {createdInfo && (
        <Card className="border-green-500 bg-green-500/10">
          <CardHeader>
            <CardTitle className="text-green-700">✅ Promoter {createdInfo.username} created successfully!</CardTitle>
            <CardDescription className="text-green-600">Please share these credentials with them. This password will not be shown again.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-background rounded-lg p-4 flex justify-between items-center border">
              <div>
                <p><strong>User ID:</strong> {createdInfo.userid}</p>
                <p><strong>Password:</strong> {createdInfo.defaultPassword}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Promoter Details</CardTitle>
          <CardDescription>Fill in the details for the new promoter.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Full Name (Required)</Label>
              <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email (Required)</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobNo">Mobile Number (Required)</Label>
                <Input id="mobNo" name="mobNo" value={formData.mobNo} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-4">Optional Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/promoter/my-network")}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Promoter"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
