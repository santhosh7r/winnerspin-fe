"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchMyNetwork, type Promoter, type Customer } from "@/lib/promoter/networkSlice"
import { AppDispatch, RootState } from "@/lib/store"
import { Eye, Network, UserPlus, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { cn } from "@/lib/utils"

export default function MyNetworkPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { currentSeason } = useSelector((state: RootState) => state.season)
  const { data, isLoading } = useSelector((state: RootState) => state.network)

  const [promoterTab, setPromoterTab] = useState("self-made")
  const [customerTab, setCustomerTab] = useState("self-made")

  useEffect(() => {
    dispatch(fetchMyNetwork(currentSeason?._id))
  }, [dispatch, currentSeason])

  const stats = data?.counts || {
    selfMadePromoters: 0,
    totalNetworkPromoters: 0,
    selfMadeCustomers: 0,
    totalNetworkCustomers: 0
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">My Network</h1>
          <p className="text-sm text-muted-foreground">Manage your sub-promoters and their customers</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/promoter/create-promoter" className="w-full sm:w-auto">
            <Button className="w-full">+ Add Promoter</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate uppercase tracking-wider text-muted-foreground">Self Made Promoters</CardTitle>
            <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent><div className="text-lg sm:text-2xl font-bold">{stats.selfMadePromoters}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate uppercase tracking-wider text-muted-foreground">My Network Promoters</CardTitle>
            <Network className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent><div className="text-lg sm:text-2xl font-bold">{stats.totalNetworkPromoters}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate uppercase tracking-wider text-muted-foreground">Self Made Customers</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent><div className="text-lg sm:text-2xl font-bold">{stats.selfMadeCustomers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate uppercase tracking-wider text-muted-foreground">My Network Customers</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent><div className="text-lg sm:text-2xl font-bold">{stats.totalNetworkCustomers}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="promoters" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 h-auto p-1 bg-muted/20">
          <TabsTrigger value="promoters" className="text-xs py-2 whitespace-normal h-full leading-tight">Promoters</TabsTrigger>
          <TabsTrigger value="customers" className="text-xs py-2 whitespace-normal h-full leading-tight">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="promoters">
          <Card className="border-0 sm:border shadow-none sm:shadow-sm">
            <CardHeader className="px-0 sm:px-6">
              <Tabs value={promoterTab} onValueChange={setPromoterTab} className="w-full">
                <TabsList className="w-full flex sm:w-auto h-9">
                  <TabsTrigger value="self-made" className="flex-1 sm:px-4 text-[10px] sm:text-xs">Self Made</TabsTrigger>
                  <TabsTrigger value="network" className="flex-1 sm:px-4 text-[10px] sm:text-xs">My Network</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <div className="overflow-x-auto w-full no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Promoter ID</TableHead>
                      <TableHead className="whitespace-nowrap">Name</TableHead>
                      <TableHead className="whitespace-nowrap">Email</TableHead>
                      <TableHead className="whitespace-nowrap">Mobile</TableHead>
                      {promoterTab === "network" && <TableHead className="whitespace-nowrap">Created By</TableHead>}
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(promoterTab === "self-made" ? data?.selfMadePromoters : data?.networkPromoters)?.map((promoter: Promoter) => (
                      <TableRow key={promoter._id} className={promoter.isActive === false ? "opacity-60" : ""}>
                        <TableCell className="font-medium whitespace-nowrap">{promoter.userid}</TableCell>
                        <TableCell className="whitespace-nowrap">{promoter.username}</TableCell>
                        <TableCell className="whitespace-nowrap">{promoter.email}</TableCell>
                        <TableCell className="whitespace-nowrap">{promoter.mobNo}</TableCell>
                        {promoterTab === "network" && (
                          <TableCell className="whitespace-nowrap">{promoter.parentPromoter?.username || "Unknown"}</TableCell>
                        )}
                        <TableCell className="whitespace-nowrap">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs",
                            promoter.isActive === false ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          )}>
                            {promoter.isActive === false ? "Inactive" : "Active"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Link href={`/promoter/my-network/${promoter._id}`}>
                            <Button variant="outline" size="sm" className="h-8"><Eye className="h-4 w-4 mr-1"/> View Profile</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!data || (promoterTab === "self-made" ? data.selfMadePromoters.length === 0 : data.networkPromoters.length === 0)) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground text-xs">
                          {isLoading ? "Loading..." : "No promoters found."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card className="border-0 sm:border shadow-none sm:shadow-sm">
            <CardHeader className="px-0 sm:px-6">
              <Tabs value={customerTab} onValueChange={setCustomerTab} className="w-full">
                <TabsList className="w-full flex sm:w-auto h-9">
                  <TabsTrigger value="self-made" className="flex-1 sm:px-4 text-[10px] sm:text-xs">Self Made</TabsTrigger>
                  <TabsTrigger value="network" className="flex-1 sm:px-4 text-[10px] sm:text-xs">My Network</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <div className="overflow-x-auto w-full no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Card No</TableHead>
                      <TableHead className="whitespace-nowrap">Name</TableHead>
                      <TableHead className="whitespace-nowrap">Email</TableHead>
                      <TableHead className="whitespace-nowrap">Mobile</TableHead>
                      {customerTab === "network" && <TableHead className="whitespace-nowrap">Created By</TableHead>}
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(customerTab === "self-made" ? data?.selfMadeCustomers : data?.networkCustomers)?.map((customer: Customer) => (
                      <TableRow key={customer._id}>
                        <TableCell className="font-medium whitespace-nowrap">{customer.cardNo || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap">{customer.username}</TableCell>
                        <TableCell className="whitespace-nowrap">{customer.email}</TableCell>
                        <TableCell className="whitespace-nowrap">{customer.mobile}</TableCell>
                        {customerTab === "network" && (
                          <TableCell className="whitespace-nowrap">{customer.promoter?.username || "Unknown"}</TableCell>
                        )}
                        <TableCell className="whitespace-nowrap">
                          <span className={cn(
                             "px-2 py-1 rounded text-xs",
                             customer.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          )}>
                              {customer.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Link href={`/promoter/customers/${customer._id}`}>
                             <Button variant="outline" size="sm" className="h-8"><Eye className="h-4 w-4 mr-1"/> View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!data || (customerTab === "self-made" ? data.selfMadeCustomers.length === 0 : data.networkCustomers.length === 0)) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground text-xs">
                           {isLoading ? "Loading..." : "No customers found."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
