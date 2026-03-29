import { getMonthlyProfit } from "@/actions/monthly-profit";
import { Prisma } from "@/generated/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function money(n: { toString: () => string }) {
  return n.toString();
}

function monthLabel(d: Date) {
  return d.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function sumDecimals(values: Prisma.Decimal[]) {
  return values.reduce(
    (a, b) => a.plus(b),
    new Prisma.Decimal(0),
  );
}

export default async function MonthlyProfitPage() {
  const rows = await getMonthlyProfit();

  const totals =
    rows.length > 0
      ? {
          orders: rows.reduce((a, r) => a + r.orderCount, 0),
          buy: sumDecimals(rows.map((r) => r.totalBuy)),
          sell: sumDecimals(rows.map((r) => r.totalSell)),
          profit: sumDecimals(rows.map((r) => r.totalProfit)),
        }
      : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl tracking-tight">
          Monthly profit
        </h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
          Totals use each order&apos;s <strong>order date</strong> (not when the row was
          saved). Super Admins see all shops; Shop Admins see only their customers.
        </p>
      </div>

      <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">By month</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right tabular-nums">Orders</TableHead>
                <TableHead className="text-right tabular-nums">Outcome (buy)</TableHead>
                <TableHead className="text-right tabular-nums">Income (sell)</TableHead>
                <TableHead className="text-right tabular-nums">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {rows.map((r) => (
                    <TableRow key={r.monthStart.toISOString()}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {monthLabel(r.monthStart)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.orderCount}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {money(r.totalBuy)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(r.totalSell)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {money(r.totalProfit)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {totals && (
                    <TableRow className="bg-muted/40 font-medium border-t-2 border-border">
                      <TableCell>Total (all months shown)</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {totals.orders}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {money(totals.buy)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(totals.sell)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(totals.profit)}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
