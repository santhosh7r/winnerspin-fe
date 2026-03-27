"use client"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import { fetchNetworkPromoter, clearDetailPromoter } from "@/lib/promoter/networkSlice"
import { AppDispatch, RootState } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SeasonSwitcher } from "@/components/promoter/season-switcher"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, Info, Eye } from "lucide-react"

export default function NetworkPromoterDetailPage() {
  const params = useParams()
  const id = params.id as string
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const { currentSeason } = useSelector((state: RootState) => state.season)
  const { detailPromoter, isLoading, error } = useSelector((state: RootState) => state.network)
  
  const [customerTab, setCustomerTab] = useState("self-made")

  useEffect(() => {
    if (id) {
      dispatch(fetchNetworkPromoter({ id, seasonId: currentSeason?._id }))
    }
  }, [dispatch, id, currentSeason])

  useEffect(() => {
    return () => {
      dispatch(clearDetailPromoter())
    }
  }, [dispatch])

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/promoter/my-network")}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to My Network
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const promoter = detailPromoter?.promoter
  const selfMadeCustomers = detailPromoter?.selfMadeCustomers || []
  const networkCustomers = detailPromoter?.networkCustomers || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" className="mb-2 -ml-4" onClick={() => router.push("/promoter/my-network")}>
            <ChevronLeft className="mr-2 h-4 w-4" /> My Network
          </Button>
          <h1 className="text-3xl font-bold text-primary">
            {promoter?.username || "Loading..."}
          </h1>
          <p className="text-muted-foreground">Promoter Details</p>
        </div>
        <div className="flex items-center gap-2">
          <SeasonSwitcher />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !promoter ? (
            <p>Loading details...</p>
          ) : promoter ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p>{promoter.userid}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                 {promoter.isActive === false ? (
                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                      Inactive <Info className="inline h-3 w-3 ml-1"/>
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                      Active
                    </span>
                 )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{promoter.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                <p>{promoter.mobNo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created By</p>
                <p>{promoter.parentPromoter?.username || "Unknown"}</p>
              </div>
            </div>
          ) : (
            <p>Promoter details not available.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
           <div className="flex justify-between items-center mb-4">
             <CardTitle>Customers</CardTitle>
           </div>
           <Tabs value={customerTab} onValueChange={setCustomerTab} className="w-[400px]">
             <TabsList>
               <TabsTrigger value="self-made">Self-Made ({selfMadeCustomers.length})</TabsTrigger>
               <TabsTrigger value="network">Network ({networkCustomers.length})</TabsTrigger>
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
                {(customerTab === "self-made" ? selfMadeCustomers : networkCustomers).map((customer: any) => (
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
                      <Button asChild variant="outline" size="sm">
                        <a href={`/promoter/customers/${customer._id}`}><Eye className="h-4 w-4 mr-1"/> View</a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(customerTab === "self-made" ? selfMadeCustomers : networkCustomers).length === 0 && (
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
    </div>
  )
}
