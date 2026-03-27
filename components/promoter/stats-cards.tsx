"use client"
import { useSelector } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Wallet, Network, UserPlus } from "lucide-react"
import type { RootState } from "@/lib/store"

export function StatsCards() {
  const { user } = useSelector((state: RootState) => state.auth)
  const { repayments } = useSelector((state: RootState) => state.repayment)
  const { currentSeason } = useSelector((state: RootState) => state.season)
  const { data: networkData } = useSelector((state: RootState) => state.network)
  const isApproved = user?.status === "approved"

  // Correctly calculate total repayments from the nested structure
  const totalRepayments = repayments.reduce((count, customer) => count + customer.installments.length, 0)
  const totalCustomersWithRepayments = repayments.length

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomersWithRepayments,
      icon: Users,
      description: "Customers with repayments",
    },
    {
      title: "Repayments",
      value: totalRepayments,
      icon: CreditCard,
      description: currentSeason ? `In ${currentSeason.season}` : "All seasons",
    },
    {
      title: "My Network Promoters",
      value: networkData?.counts?.totalNetworkPromoters || 0,
      icon: Network,
      description: "Promoters in your network",
    },
    {
      title: "Network Customers",
      value: networkData?.counts?.totalNetworkCustomers || 0,
      icon: Users,
      description: "Customers in your network",
    },
    {
      title: "Self-Made Promoters",
      value: networkData?.counts?.selfMadePromoters || 0,
      icon: UserPlus,
      description: "Directly created promoters",
    },
  ]

  if (isApproved) {
    stats.push({
      title: "Balance",
      value: user?.balance|| 0,
      icon: Wallet,
      description: "Available earnings",
    })
  }

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
