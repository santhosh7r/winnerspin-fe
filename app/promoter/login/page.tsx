"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginPromoter } from "@/lib/promoter/authSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { ThemeProvider } from "@/components/theme-provider"
import Image from "next/image"
import logo from "@/public/Logo-WS.png"

export default function PromoterLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(loginPromoter({ username, password })).unwrap()
      router.push("/promoter/dashboard")
    } catch (error) {
      // Error is handled by Redux
      console.error(error);
    }
  }

  return (
  <ThemeProvider>
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
      <div className="w-full flex justify-center">
        <Image src={logo} alt="Logo" height={72} className="mr-2" />
      </div>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Promoter Login</CardTitle>
          <CardDescription>Sign in to your promoter account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Email or Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Email or Username"
                required
                />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </ThemeProvider>
  )
}
