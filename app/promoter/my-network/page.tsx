"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchMyNetwork } from "@/lib/promoter/networkSlice"
import { AppDispatch, RootState } from "@/lib/store"
import { Eye, Info, Network, UserPlus, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

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
          <h1 className="text-3xl font-bold text-primary">My Network</h1>
          <p className="text-muted-foreground">Manage your sub-promoters and their customers</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/promoter/create-promoter">
            <Button>+ Add Promoter</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Self-Made Promoters</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.selfMadePromoters}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Network Promoters</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalNetworkPromoters}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Self-Made Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.selfMadeCustomers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Network Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalNetworkCustomers}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="promoters" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="promoters">Promoters in My Network</TabsTrigger>
          <TabsTrigger value="customers">Customers in My Network</TabsTrigger>
        </TabsList>

        <TabsContent value="promoters">
          <Card>
            <CardHeader>
              <Tabs value={promoterTab} onValueChange={setPromoterTab} className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="self-made">Self-Made (Direct)</TabsTrigger>
                  <TabsTrigger value="network">Network (All Descendants)</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Promoter ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      {promoterTab === "network" && <TableHead>Created By</TableHead>}
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(promoterTab === "self-made" ? data?.selfMadePromoters : data?.networkPromoters)?.map((promoter) => (
                      <TableRow key={promoter._id} className={promoter.isActive === false ? "opacity-60" : ""}>
                        <TableCell className="font-medium">{promoter.userid}</TableCell>
                        <TableCell>{promoter.username}</TableCell>
                        <TableCell>{promoter.email}</TableCell>
                        <TableCell>{promoter.mobNo}</TableCell>
                        {promoterTab === "network" && (
                          <TableCell>{promoter.parentPromoter?.username || "Unknown"}</TableCell>
                        )}
                        <TableCell>
                          {promoter.isActive === false ? (
                            <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800" title="Not active this season">
                              Not active this season <Info className="inline h-3 w-3 ml-1"/>
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link href={`/promoter/my-network/${promoter._id}`}>
                            <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1"/> View Profile</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!data || (promoterTab === "self-made" ? data.selfMadePromoters.length === 0 : data.networkPromoters.length === 0)) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
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
          <Card>
            <CardHeader>
              <Tabs value={customerTab} onValueChange={setCustomerTab} className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="self-made">Self-Made Customers</TabsTrigger>
                  <TabsTrigger value="network">Network Customers</TabsTrigger>
                </TabsList>
              </Tabs>
              <CardDescription>
                {currentSeason ? `Showing customers for ${currentSeason.season}` : "Showing all customers"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Card No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      {customerTab === "network" && <TableHead>Created By</TableHead>}
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(customerTab === "self-made" ? data?.selfMadeCustomers : data?.networkCustomers)?.map((customer) => (
                      <TableRow key={customer._id}>
                        <TableCell className="font-medium">{customer.cardNo || "-"}</TableCell>
                        <TableCell>{customer.username}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.mobile}</TableCell>
                        {customerTab === "network" && (
                          <TableCell>{customer.promoter?.username || "Unknown"}</TableCell>
                        )}
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${customer.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {customer.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link href={`/promoter/customers/${customer._id}`}>
                             <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1"/> View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!data || (customerTab === "self-made" ? data.selfMadeCustomers.length === 0 : data.networkCustomers.length === 0)) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
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
