import { getDashboardStats } from "@/actions/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Users } from "lucide-react";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl tracking-tight">
          Overview
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Quick snapshot of your MLBB diamond order activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customers
            </CardTitle>
            <Users className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl tabular-nums">
              {stats.customerCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orders
            </CardTitle>
            <Package className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl tabular-nums">
              {stats.orderCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net profit (total)
            </CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl tabular-nums">
              {stats.netProfitTotal}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
