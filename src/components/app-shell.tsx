import Link from "next/link";
import { auth } from "@/auth";
import { signOutAction } from "@/actions/auth";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileNav } from "@/components/mobile-nav";
import {
  BookOpen,
  CalendarRange,
  CreditCard,
  Inbox,
  LayoutDashboard,
  LogOut,
  Package,
  Settings2,
  Users,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/public-orders", label: "Public orders", icon: Inbox },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/reports/monthly", label: "Monthly profit", icon: CalendarRange },
  { href: "/order-types", label: "Order types", icon: Settings2 },
  { href: "/payment-accounts", label: "Payment accounts", icon: CreditCard },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const email = session?.user?.email ?? "";

  return (
    <div className="paper-bg min-h-screen flex items-start">
      <aside className="hidden md:flex md:sticky md:top-0 md:h-screen md:w-56 shrink-0 flex-col border-r border-border bg-card/80 backdrop-blur-sm overflow-y-auto">
        <div className="p-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2 font-heading text-lg tracking-tight">
            <BookOpen className="size-5 text-primary" aria-hidden />
            <span>Mythic Ledger</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1.5 leading-snug">
            Order and customer records
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card/60 backdrop-blur-sm flex items-center justify-between px-4 md:px-8 gap-3">
          <div className="flex items-center gap-2 md:hidden">
            <MobileNav />
            <span className="font-heading text-sm font-semibold">Mythic Ledger</span>
          </div>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "max-w-[220px] truncate",
                )}
              >
                {email}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                    Admin
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="p-0 focus:bg-transparent">
                    <form action={signOutAction} className="w-full">
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        <LogOut className="size-4" />
                        Sign out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
