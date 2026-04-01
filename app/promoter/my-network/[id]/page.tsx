"use client"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import { fetchNetworkPromoter, clearDetailPromoter } from "@/lib/promoter/networkSlice"
import { AppDispatch, RootState } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, Info, Eye, CheckCircle2, ShieldCheck } from "lucide-react"

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
          <p className="text-muted-foreground">Promoter Profile & Network Status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && !promoter ? (
              <p>Loading details...</p>
            ) : promoter ? (
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                  <p className="font-semibold">{promoter.userid}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                   {promoter.isActive === false ? (
                      <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 font-medium">
                        Inactive
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 font-medium">
                        Active
                      </span>
                   )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="truncate" title={promoter.email}>{promoter.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                  <p>{promoter.mobNo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Season Status ({currentSeason?.season})</p>
                  {promoter.isActiveInSeason ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100 w-fit">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Activated
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 w-fit">
                      <Info className="h-3.5 w-3.5" /> Pending Approval
                    </span>
                  )}
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

        {/* Network Stats Card */}
        <Card className="border-primary/10 bg-primary/[0.02]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Network Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-background rounded-lg border border-border shadow-sm text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Self Made</p>
                    <p className="text-xl font-bold text-primary">{selfMadeCustomers.length}</p>
                </div>
                <div className="p-3 bg-background rounded-lg border border-border shadow-sm text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">My Network</p>
                    <p className="text-xl font-bold text-primary">{networkCustomers.length}</p>
                </div>
             </div>
             <p className="text-[10px] text-muted-foreground text-center italic">
                Enrollment data filtered for season: <span className="font-bold">{currentSeason?.season}</span>
             </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
           <div className="flex justify-between items-center mb-4">
             <CardTitle>Enrollment History</CardTitle>
           </div>
           <Tabs value={customerTab} onValueChange={setCustomerTab} className="w-full sm:w-[400px]">
             <TabsList className="grid w-full grid-cols-2">
               <TabsTrigger value="self-made">Self Made ({selfMadeCustomers.length})</TabsTrigger>
               <TabsTrigger value="network">My Network ({networkCustomers.length})</TabsTrigger>
             </TabsList>
           </Tabs>
           <CardDescription className="pt-2">
              Customer registrations performed by this promoter and their network.
           </CardDescription>
        </CardHeader>
        <CardContent>
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
                {(customerTab === "self-made" ? selfMadeCustomers : networkCustomers).map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-medium whitespace-nowrap">{customer.cardNo || "-"}</TableCell>
                    <TableCell className="whitespace-nowrap">{customer.username}</TableCell>
                    <TableCell className="whitespace-nowrap">{customer.email}</TableCell>
                    <TableCell className="whitespace-nowrap">{customer.mobile}</TableCell>
                    {customerTab === "network" && (
                      <TableCell className="whitespace-nowrap">{customer.promoter?.username || "Unknown"}</TableCell>
                    )}
                    <TableCell className="whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${customer.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {customer.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button asChild variant="outline" size="sm" className="h-8">
                        <a href={`/promoter/customers/${customer._id}`} className="flex items-center">
                          <Eye className="h-3 w-3 mr-1"/> View
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(customerTab === "self-made" ? selfMadeCustomers : networkCustomers).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs italic">
                        {isLoading ? "Loading..." : "No enrollment records found for this season."}
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
