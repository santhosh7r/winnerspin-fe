"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CreditCard, User, Network, UserPlus, TrendingUp, Banknote, Image as ImageIcon, ArrowDownToLine } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/promoter/dashboard", icon: LayoutDashboard },
  { name: "My Customers", href: "/promoter/customers", icon: Users },
  { name: "My Network", href: "/promoter/my-network", icon: Network },
  { name: "Recruit", href: "/promoter/create-promoter", icon: UserPlus },
  { name: "Repayments", href: "/promoter/repayments", icon: CreditCard },
  { name: "Earnings", href: "/promoter/earnings", icon: TrendingUp },
  { name: "Withdrawals", href: "/promoter/withdrawals", icon: ArrowDownToLine },
  { name: "Profile", href: "/promoter/profile", icon: User },
  { name: "Payment", href: "/promoter/payment-details", icon: Banknote },
  { name: "Posters", href: "/promoter/posters", icon: ImageIcon },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-40">
      <nav className="flex justify-around py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-w-0",
                isActive ? "text-sidebar-primary" : "text-sidebar-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
