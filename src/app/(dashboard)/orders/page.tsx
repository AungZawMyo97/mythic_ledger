import Link from "next/link";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  listOrdersPaginated,
  updateOrder,
} from "@/actions/orders";
import { listCustomers } from "@/actions/customers";
import { listOrderTypesActive } from "@/actions/order-types";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/table-pagination";
import { buttonVariants } from "@/lib/button-variants";
import { toDateTimeLocalValue } from "@/lib/datetime-input";
import { DEFAULT_PAGE_SIZE, parsePage } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatOrderDate(d: Date) {
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const editId = sp.edit;
  const page = parsePage(sp.page);

  const [table, customers, types, editing] = await Promise.all([
    listOrdersPaginated(page, DEFAULT_PAGE_SIZE),
    listCustomers(),
    listOrderTypesActive(),
    editId ? getOrderById(editId) : Promise.resolve(null),
  ]);

  const orders = table.items;
  const money = (n: { toString: () => string }) => n.toString();
  const nowLocal = toDateTimeLocalValue(new Date());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Buying and selling prices are auto-filled from the selected package.
        </p>
      </div>

      {types.length === 0 && (
        <p className="text-sm text-amber-800 dark:text-amber-200 border border-border rounded-md p-3 bg-muted/50">
          No active order types yet. Add package types with prices first.
        </p>
      )}

      <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            {editing ? "Edit order" : "New order"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a customer first, then create an order.
            </p>
          ) : editing ? (
            <form
              key={editing.id}
              action={updateOrder.bind(null, editing.id)}
              className="grid gap-4 sm:grid-cols-2 max-w-3xl"
            >
              <div className="space-y-2 sm:col-span-2 max-w-md">
                <Label htmlFor="orderDate">Order date</Label>
                <Input
                  id="orderDate"
                  name="orderDate"
                  type="datetime-local"
                  required
                  defaultValue={toDateTimeLocalValue(editing.orderDate)}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  When the sale happened (can differ from when you save this row).
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2 max-w-md">
                <Label htmlFor="customerId">Customer</Label>
                <select
                  id="customerId"
                  name="customerId"
                  defaultValue={editing.customerId}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.ingameId} - zone {c.zoneId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2 max-w-md">
                <Label htmlFor="orderTypeId">Order type</Label>
                <select
                  id="orderTypeId"
                  name="orderTypeId"
                  defaultValue={editing.orderTypeId}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  <option value="">Select...</option>
                  {!types.some((t) => t.id === editing.orderTypeId) && (
                    <option value={editing.orderTypeId}>
                      {editing.orderType.type} (Inactive)
                    </option>
                  )}
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.type} (Buy {money(t.buyingPrice)} / Sell {money(t.sellingPrice)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">Save</Button>
                <Link
                  href="/orders"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Cancel
                </Link>
              </div>
            </form>
          ) : (
            <form key="new" action={createOrder} className="grid gap-4 sm:grid-cols-2 max-w-3xl">
              <div className="space-y-2 sm:col-span-2 max-w-md">
                <Label htmlFor="orderDate">Order date</Label>
                <Input
                  id="orderDate"
                  name="orderDate"
                  type="datetime-local"
                  required
                  defaultValue={nowLocal}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Defaults to now; change if you are entering a past sale.
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2 max-w-md">
                <Label htmlFor="customerId">Customer</Label>
                <select
                  id="customerId"
                  name="customerId"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  <option value="">Select...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.ingameId} - zone {c.zoneId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2 max-w-md">
                <Label htmlFor="orderTypeId">Order type</Label>
                <select
                  id="orderTypeId"
                  name="orderTypeId"
                  required
                  disabled={types.length === 0}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  <option value="">Select...</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.type} (Buy {money(t.buyingPrice)} / Sell {money(t.sellingPrice)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={types.length === 0}>
                  Add order
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">All orders</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Buy</TableHead>
                <TableHead className="text-right">Sell</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatOrderDate(o.orderDate)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {o.customer.ingameId}{" "}
                      <span className="text-muted-foreground text-xs">z{o.customer.zoneId}</span>
                    </TableCell>
                    <TableCell>{o.orderType.type}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(o.buyingPrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(o.sellingPrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {money(o.netProfit)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link
                        href={`/orders?edit=${o.id}&page=${table.page}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Edit
                      </Link>
                      <form action={deleteOrder.bind(null, o.id)} className="inline">
                        <Button size="sm" variant="destructive" type="submit">
                          Delete
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            pathname="/orders"
            page={table.page}
            totalPages={table.totalPages}
            total={table.total}
            extra={editId ? { edit: editId } : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
