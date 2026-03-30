"use client"
import { useEffect } from "react"
import { format } from "date-fns"
import { useDispatch, useSelector } from "react-redux"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import * as XLSX from "xlsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchRepayments } from "@/lib/promoter/repaymentSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { AddRepaymentForm } from "./add-repayment-form"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { fetchCustomers } from "@/lib/user/customerSlice"
import { Download, Lock } from "lucide-react"

export function RepaymentTable() {
  const dispatch = useDispatch<AppDispatch>()
  const {customers} = useSelector((state: RootState) => state.customer)
  const { repayments, isLoading, error } = useSelector((state: RootState) => state.repayment)
  const { currentSeason } = useSelector((state: RootState) => state.season)
  
  useEffect(() => {
    if (currentSeason && !customers.length) dispatch(fetchCustomers(currentSeason._id))
  }, [currentSeason, customers.length, dispatch])
  
  useEffect(() => {
    if (currentSeason) {
      dispatch(fetchRepayments(currentSeason._id))
    }
  }, [dispatch, currentSeason])

  const handleRepaymentSuccess = () => {
    if (currentSeason) dispatch(fetchRepayments(currentSeason._id))
  }

  const isLoadingInitial = isLoading && repayments.length === 0

  const getMonthHeaders = () => {
    if (!currentSeason) return []
    const headers = []
    const start = new Date(currentSeason.startDate)
    const end = new Date(currentSeason.endDate)

    const current = start
    while (current <= end) {
      headers.push(new Date(current))
      current.setMonth(current.getMonth() + 1)
    }
    return headers
  }

  const monthHeaders = getMonthHeaders()

  const handleDownloadExcel = () => {
    if (!repayments.length || !currentSeason) return

    const tableHeaders = ["Customer Name", "Card Number", ...monthHeaders.map((month) => format(month, "MMM yyyy"))]
    const tableData = [tableHeaders]

    repayments.forEach((customer) => {
      const paidInstallmentNumbers = customer.installments
        .filter((inst) => inst.isVerified)
        .map((inst) => inst.installmentNo)
      const pendingInstallmentNumbers = customer.installments
        .filter((inst) => !inst.isVerified)
        .map((inst) => inst.installmentNo)
      const dueInstallments = customer.dues.map((due) => due.installmentNo)

      const row = [customer.customerName, customer.cardNo]
      monthHeaders.forEach((_month, index) => {
        const installmentNo = index + 1
        const isPaid = paidInstallmentNumbers.includes(installmentNo) || pendingInstallmentNumbers.includes(installmentNo)
        const isDue = dueInstallments.includes(installmentNo)
        row.push(isPaid ? "Paid" : isDue ? "Due" : "-")
      })
      tableData.push(row)
    })

    // Create a new workbook and a worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(tableData)

    // Set column widths
    const columnWidths = [{ wch: 25 }, { wch: 15 }, ...monthHeaders.map(() => ({ wch: 15 }))]
    ws["!cols"] = columnWidths

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, `Installment Report`)

    // Generate and download the Excel file
    XLSX.writeFile(wb, `repayment_status_${currentSeason.season}_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  if (isLoadingInitial) {
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
      {error ? (
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription className="ml-2">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      ) : (
      <>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Installment Status</CardTitle>
          <CardDescription>
            An overview of all customer dues and payments for the current season.
          </CardDescription>
        </div>
        <Button onClick={handleDownloadExcel} variant="outline" size="sm" className="gap-2" disabled={repayments.length === 0}>
          <Download className="h-4 w-4" /> Download Excel
        </Button>
      </CardHeader>
      <CardContent>
        {repayments.length === 0 && !isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No customers found for this season.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  {monthHeaders.map((month) => (
                    <TableHead key={month.toISOString()} className="text-center">
                      {format(month, "MMM yyyy")}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {repayments.map((customer) => {
                  const paidInstallmentNumbers = customer.installments
                    .filter((inst) => inst.isVerified)
                    .map((inst) => inst.installmentNo)
                  const pendingInstallmentNumbers = customer.installments
                    .filter((inst) => !inst.isVerified)
                    .map((inst) => inst.installmentNo)
                  const dueInstallments = customer.dues.map((due) => due.installmentNo)

                  return (
                    <TableRow key={customer.customerId}>
                      <TableCell className="font-medium">
                        <div className="font-bold">{customer.customerName}</div>
                        <div className="text-xs text-muted-foreground">{customer.cardNo}</div>
                      </TableCell>
                      {monthHeaders.map((month, index) => {
                        const installmentNo = index + 1
                        const isPaid = paidInstallmentNumbers.includes(installmentNo)
                        const isPending = pendingInstallmentNumbers.includes(installmentNo)
                        const isDue = dueInstallments.includes(installmentNo)

                        return (
                          <TableCell key={month.toISOString()} className="text-center">
                            {isPending ? (
                              <Badge variant="secondary">Pending</Badge>
                            ) : isPaid ? (
                              <Badge variant="default">Paid</Badge>
                            ) : isDue ? (
                              <AddRepaymentForm
                                customerId={customer.customerId}
                                customerName={customer.customerName}
                                onSuccess={handleRepaymentSuccess}
                              />
                            ) : (
                              <Badge variant="outline">-</Badge>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      </>
      )}
    </Card>
  )
}
