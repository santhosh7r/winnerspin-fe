"use client"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { useDispatch, useSelector } from "react-redux"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import * as XLSX from "xlsx"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Lock, Eye, Download } from "lucide-react"
import { fetchCustomers } from "@/lib/user/customerSlice"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import type { AppDispatch, RootState } from "@/lib/store"
import { fetchSeasons } from "@/lib/seasonSlice"

export function CustomerTable() {
  const dispatch = useDispatch<AppDispatch>()

  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState<"approved" | "rejected">("approved")
  const { customers, isLoading, error } = useSelector((state: RootState) => state.customer)
  const { currentSeason } = useSelector((state: RootState) => state.season)
  useEffect(() => {
    if (currentSeason) {
      dispatch(fetchCustomers(currentSeason._id))
    } else {
      dispatch(fetchSeasons())
    }
  }, [dispatch, currentSeason])

  const filteredCustomers = customers
    .filter((customer) => (view === "rejected" ? customer.status === "rejected" : customer.status !== "rejected"))
    .filter(
      (customer) =>
        customer.username.toLowerCase().includes(searchTerm.toLowerCase()) || (customer.cardNo && customer.cardNo.toLowerCase().includes(searchTerm.toLowerCase())),
    )

  const handleDownloadExcel = () => {
    if (!filteredCustomers.length) return

    const tableHeaders = ["Name", "Card No", "Mobile", "Email", "City", "Joined Date"]
    const tableData: (string | number)[][] = [tableHeaders]

    filteredCustomers.forEach((customer) => {
      tableData.push([
        customer.username,
        customer.cardNo,
        customer.mobile,
        customer.email,
        customer.city,
        format(new Date(customer.createdAt), "dd/MM/yyyy"),
      ])
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(tableData)

    // Set column widths for better readability
    ws["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 15 }]

    XLSX.utils.book_append_sheet(wb, ws, "Customers")

    const fileName = `customers_${currentSeason?.season || "all"}_${new Date().toISOString().split("T")[0]}.xlsx`
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

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription className="ml-2">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="sm:w-1/4">
            <CardTitle>{view === "approved" ? "All Customers" : "Rejected Customers"}</CardTitle>
            <CardDescription>Manage your customer database</CardDescription>
            <div className="flex gap-2 mt-2">
              <Button onClick={() => setView("approved")} variant={view === "approved" ? "default" : "outline"} size="sm">
                Approved
              </Button>
              <Button onClick={() => setView("rejected")} variant={view === "rejected" ? "default" : "outline"} size="sm">
                Rejected
              </Button>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-3/4">
            <div className="relative flex-1 sm:flex-initial w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or card..."
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
            <p className="text-muted-foreground">No customers yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full no-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Username</TableHead>
                  <TableHead className="whitespace-nowrap">Email</TableHead>
                  <TableHead className="whitespace-nowrap">Mobile</TableHead>
                  <TableHead className="whitespace-nowrap">Card No</TableHead>
                  <TableHead className="whitespace-nowrap">City</TableHead>
                  <TableHead className="whitespace-nowrap">Joined Date</TableHead>
                  <TableHead className="whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-medium whitespace-nowrap">
                        {customer.username}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{customer.email}</TableCell>
                    <TableCell className="whitespace-nowrap">{customer.mobile}</TableCell>
                    <TableCell className="whitespace-nowrap">{customer.cardNo}</TableCell>
                    <TableCell className="whitespace-nowrap">{customer.city}</TableCell>
                    <TableCell className="whitespace-nowrap">{format(new Date(customer.createdAt), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="flex gap-2 whitespace-nowrap">
                        <Button asChild variant="outline" size="sm" className="gap-2 bg-transparent h-8">
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
