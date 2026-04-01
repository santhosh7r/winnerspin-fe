"use client"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { useDispatch } from "react-redux"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  Network, 
  UserPlus, 
  CreditCard, 
  TrendingUp, 
  ArrowDownToLine, 
  Banknote, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/promoter/authSlice"
import type { AppDispatch } from "@/lib/store"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SeasonSwitcher } from "@/components/promoter/season-switcher"

const navigation = [
  { name: "Dashboard", href: "/promoter/dashboard", icon: LayoutDashboard },
  { name: "My Customers", href: "/promoter/customers", icon: Users },
  { name: "My Network", href: "/promoter/my-network", icon: Network },
  { name: "Recruit Promoter", href: "/promoter/create-promoter", icon: UserPlus },
  { name: "Repayments", href: "/promoter/repayments", icon: CreditCard },
  { name: "Earnings", href: "/promoter/earnings", icon: TrendingUp },
  { name: "Withdrawals", href: "/promoter/withdrawals", icon: ArrowDownToLine },
  { name: "Payment Details", href: "/promoter/payment-details", icon: Banknote },
  { name: "Profile", href: "/promoter/profile", icon: User },
]

export function Sidebar({ 
  isCollapsed, 
  toggleCollapse 
}: { 
  isCollapsed: boolean; 
  toggleCollapse: () => void 
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()

  const handleLogout = () => {
    dispatch(logout())
    setLogoutDialogOpen(false)
  }

  const SidebarContent = (
    <div className="flex flex-col h-full bg-background relative border-r border-border/50">
      {/* Logo Section */}
      <div className="flex flex-col items-center justify-center py-8 min-h-[120px] overflow-hidden">
        <div className="relative w-[160px] h-[70px] flex items-center justify-center">
          <Image
            src="/Logo-WS.png"
            alt="Logo"
            width={180}
            height={180}
            className={cn(
              "object-contain transition-all duration-300 absolute pointer-events-none",
              isCollapsed ? "scale-75" : "w-[200px] scale-110 top-[-20px]"
            )}
            priority
          />
        </div>
        {!isCollapsed && (
          <div className="px-8 w-full mt-4 text-center">
            <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 uppercase">
              Promoter Menu
            </p>
          </div>
        )}
      </div>

      {/* Main Navigation - Non-scrollable */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-hidden">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex items-center rounded-xl text-sm font-medium transition-all duration-300 group overflow-hidden",
                isCollapsed ? "justify-center p-3" : "gap-4 px-4 py-3",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
              onClick={() => setMobileOpen(false)}
              title={isCollapsed ? item.name : undefined}
            >
              {isActive && (
                <span className="absolute left-0 inset-y-2 w-1 bg-primary rounded-r-md" />
              )}
              <item.icon 
                className={cn("shrink-0", isCollapsed ? "w-6 h-6" : "w-[18px] h-[18px]", isActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-foreground")} 
                strokeWidth={isActive ? 2 : 1.5} 
              />
              {!isCollapsed && <span className="truncate tracking-wide">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 flex flex-col gap-2 pb-6">
        <Button
          variant="ghost"
          className={cn(
            "hidden lg:flex w-full text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all duration-300 overflow-hidden rounded-xl",
            isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "justify-start gap-4 px-4 py-3"
          )}
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5 shrink-0" strokeWidth={1.5} /> : <ChevronLeft className="h-5 w-5 shrink-0" strokeWidth={1.5} />}
          {!isCollapsed && <span className="text-sm font-medium tracking-wide">Collapse</span>}
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-300 overflow-hidden rounded-xl",
            isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "justify-start gap-4 px-4 py-3"
          )}
          onClick={() => setLogoutDialogOpen(true)}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={2} />
          {!isCollapsed && <span className="text-sm font-medium tracking-wide">Logout</span>}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 z-50 shadow-sm transition-all duration-300">
        <div className={cn("h-full transition-all duration-300", isCollapsed ? "w-20" : "w-64")}>
          {SidebarContent}
        </div>
      </div>

      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-40 px-4 flex items-center justify-between">
         <div className="flex items-center gap-2">
           <Image src="/Logo-WS.png" alt="Logo" width={80} height={30} className="object-contain" />
         </div>
         <div className="flex items-center gap-2">
           <SeasonSwitcher />
           <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
             <SheetTrigger asChild>
               <Button variant="ghost" size="icon" className="h-10 w-10">
                 <Menu className="h-6 w-6" />
               </Button>
             </SheetTrigger>
             <SheetContent side="left" className="p-0 border-none w-72">
               {SidebarContent}
             </SheetContent>
           </Sheet>
         </div>
      </div>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold tracking-tight">Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              Are you sure you want to log out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3">
            <AlertDialogCancel className="rounded-xl font-bold border-muted-foreground/20">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold border-none shadow-lg shadow-rose-500/20 px-8"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
