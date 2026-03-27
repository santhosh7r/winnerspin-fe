"use client"
import { useState } from "react"
import { format } from "date-fns"
import { useSelector } from "react-redux"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import * as XLSX from "xlsx"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, Download, Search } from "lucide-react"
import type { RootState } from "@/lib/store"

export function NetworkCustomerTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState<"approved" | "rejected">("approved")
  
  const { data: networkData, isLoading } = useSelector((state: RootState) => state.network)
  const { currentSeason } = useSelector((state: RootState) => state.season)

  const customers = networkData?.networkCustomers || []

  // Ensure 'status' exists or use a default way to check approval
  const filteredCustomers = customers
    .filter((customer) => (view === "rejected" ? customer.status === "rejected" : customer.status !== "rejected"))
    .filter(
      (customer) =>
        customer.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (customer.cardNo && customer.cardNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.promoter?.username && customer.promoter.username.toLowerCase().includes(searchTerm.toLowerCase()))
    )

  const handleDownloadExcel = () => {
    if (!filteredCustomers.length) return

    const tableHeaders = ["Name", "Card No", "Mobile", "Email", "Created By", "Joined Date"]
    const tableData: (string | number)[][] = [tableHeaders]

    filteredCustomers.forEach((customer) => {
      tableData.push([
        customer.username,
        customer.cardNo || "",
        customer.mobile,
        customer.email,
        customer.promoter?.username || "Unknown",
        format(new Date(customer.createdAt), "dd/MM/yyyy"),
      ])
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(tableData)
    ws["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, ws, "Network Customers")
    const fileName = `network_customers_${currentSeason?.season || "all"}_${new Date().toISOString().split("T")[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="sm:w-1/3">
            <CardTitle>{view === "approved" ? "Network Customers" : "Rejected Network Customers"}</CardTitle>
            <CardDescription>Customers created by any promoter in your network</CardDescription>
            <div className="flex gap-2 mt-2">
              <Button onClick={() => setView("approved")} variant={view === "approved" ? "default" : "outline"} size="sm">
                Approved
              </Button>
              <Button onClick={() => setView("rejected")} variant={view === "rejected" ? "default" : "outline"} size="sm">
                Rejected
              </Button>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-2/3">
            <div className="relative flex-1 sm:flex-initial w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, card, or created by..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 min-w-40 sm:w-full"
              />
            </div>
            <Button onClick={handleDownloadExcel} variant="outline" size="sm" className="gap-2" disabled={filteredCustomers.length === 0}>
              <Download className="h-4 w-4" /><span className="hidden sm:block"> Download Excel</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No network customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Card No</TableHead>
                  <TableHead>Created By (promoter)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-medium">{customer.username}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.mobile}</TableCell>
                    <TableCell>{customer.cardNo || "-"}</TableCell>
                    <TableCell>{customer.promoter?.username || "Unknown"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${customer.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {customer.status}
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(customer.createdAt), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="flex gap-2">
                       <Button asChild variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Link href={`/promoter/customers/${customer._id}`}>
                            <Eye className="h-3 w-3" />
                            View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
