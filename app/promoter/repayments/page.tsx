"use client"
import { RepaymentForm } from "@/components/promoter/repayment-form"
import { RepaymentStats } from "@/components/promoter/repayment-stats"
import { RepaymentTable } from "@/components/promoter/repayment-table"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function RepaymentsPage() {
    const searchParams = useSearchParams()
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setIsFormOpen(true)
    }
  }, [searchParams])

  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Repayments</h1>
          <p className="text-muted-foreground">Track and manage customer repayments</p>
        </div>
        <RepaymentForm open={isFormOpen} onOpenChange={setIsFormOpen} />
      </div>

      <RepaymentStats />
      <RepaymentTable />
    </div>
  )
}
