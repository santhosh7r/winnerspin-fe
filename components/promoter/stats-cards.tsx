"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RootState } from "@/lib/store"
import { Network, Users, Wallet } from "lucide-react"
import { useSelector } from "react-redux"

export function StatsCards() {
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentSeason } = useSelector((state: RootState) => state.season)
  const { data: networkData } = useSelector((state: RootState) => state.network)
  const { customers } = useSelector((state: RootState) => state.customer)

  const stats = [
    {
      title: "My Balance",
      value: `₹${user?.balance?.toLocaleString() || 0}`,
      icon: Wallet,
      description: "Available earnings this season",
    },
    {
      title: "Customers (this season)",
      value: customers.length || 0,
      icon: Users,
      description: currentSeason ? `In ${currentSeason.season}` : "This season",
    },
    {
      title: "Network Size (all-time)",
      value: networkData?.counts?.totalNetworkPromoters || 0,
      icon: Network,
      description: "Promoters in your network",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
