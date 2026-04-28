import { listAdminPublicOrdersPaginated, confirmPublicOrder, rejectPublicOrder } from "@/actions/admin-public-orders";
import { TablePagination } from "@/components/table-pagination";
import { DEFAULT_PAGE_SIZE, parsePage } from "@/lib/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PUBLIC_PAYMENT_LABELS, type PublicPaymentMethod } from "@/lib/public-payment";
import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { type PublicOrderStatus } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";

function formatOrderDate(d: Date) {
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatusBadge({ status }: { status: PublicOrderStatus }) {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary">Pending</Badge>;
    case "CONFIRMED":
      return <Badge className="bg-emerald-600 hover:bg-emerald-700">Confirmed</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">Rejected</Badge>;
  }
}

export default async function AdminPublicOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const filter = sp.filter || "PENDING";

  const table = await listAdminPublicOrdersPaginated(
    page,
    filter === "PENDING" ? "PENDING" : undefined,
    DEFAULT_PAGE_SIZE
  );

  const orders = table.items;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl tracking-tight">Public Orders</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review incoming orders from customers, validate their transaction IDs, and confirm or reject them.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/public-orders?filter=PENDING"
          className={cn(buttonVariants({ variant: filter === "PENDING" ? "default" : "outline" }))}
        >
          Pending
        </Link>
        <Link
          href="/public-orders?filter=ALL"
          className={cn(buttonVariants({ variant: filter === "ALL" ? "default" : "outline" }))}
        >
          All
        </Link>
      </div>

      <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            {filter === "PENDING" ? "Pending Orders" : "All Public Orders"}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer Info</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatOrderDate(o.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>ID: {o.ingameId}</div>
                      <div className="text-muted-foreground text-xs">Zone: {o.zoneId}</div>
                    </TableCell>
                    <TableCell>{o.orderType.type}</TableCell>
                    <TableCell>
                      <div>{PUBLIC_PAYMENT_LABELS[o.paymentMethod as PublicPaymentMethod]}</div>
                      <div className="text-muted-foreground text-xs">
                        {o.paymentAccountNameSnapshot} ({o.paymentNumberSnapshot})
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono select-all">
                        {o.transactionId}
                      </code>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {o.status === "PENDING" && (
                        <div className="flex items-center justify-end gap-2">
                          <form action={confirmPublicOrder.bind(null, o.id)}>
                            <Button size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                              Confirm
                            </Button>
                          </form>
                          <form action={rejectPublicOrder.bind(null, o.id)}>
                            <Button size="sm" variant="destructive" type="submit">
                              Reject
                            </Button>
                          </form>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            pathname="/public-orders"
            page={table.page}
            totalPages={table.totalPages}
            total={table.total}
            extra={{ filter }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
