"use client"
import { CustomerTable } from "@/components/promoter/customer-table"
import { NetworkCustomerTable } from "@/components/promoter/network-customer-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomerForm } from "@/components/user/customer-form"
import { fetchMyNetwork } from "@/lib/promoter/networkSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

export default function CustomersPage() {
  const searchParams = useSearchParams()
  const [isFormOpen, setIsFormOpen] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const { data: networkData } = useSelector((state: RootState) => state.network)
  const { currentSeason } = useSelector((state: RootState) => state.season)

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setIsFormOpen(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (currentSeason) {
      dispatch(fetchMyNetwork(currentSeason._id))
    }
  }, [currentSeason, dispatch])

  const selfMadeCount = networkData?.counts?.selfMadeCustomers || 0
  const networkCount = networkData?.counts?.totalNetworkCustomers || 0
  const totalCount = selfMadeCount + networkCount

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <CustomerForm open={isFormOpen} onOpenChange={setIsFormOpen} />
      </div>

      <div className="text-sm font-medium text-muted-foreground bg-muted p-3 rounded-lg flex items-center justify-between">
        <span>Showing {selfMadeCount} self-made + {networkCount} network customers = {totalCount} Total</span>
      </div>

      <Tabs defaultValue="self-made" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="self-made">My Customers</TabsTrigger>
          <TabsTrigger value="network">Network Customers</TabsTrigger>
        </TabsList>
        <TabsContent value="self-made" className="mt-6">
          <CustomerTable />
        </TabsContent>
        <TabsContent value="network" className="mt-6">
          <NetworkCustomerTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
