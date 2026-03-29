import Link from "next/link";
import { auth } from "@/auth";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomersPaginated,
  updateCustomer,
} from "@/actions/customers";
import { listShopAdminsForSelect } from "@/actions/shop-admins";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/table-pagination";
import { buttonVariants } from "@/lib/button-variants";
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

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const sp = await searchParams;
  const editId = sp.edit;
  const page = parsePage(sp.page);
  const isSuper = session.user.role === "SUPER_ADMIN";

  const [table, shopAdmins, editing] = await Promise.all([
    listCustomersPaginated(page, DEFAULT_PAGE_SIZE),
    isSuper ? listShopAdminsForSelect() : Promise.resolve([]),
    editId ? getCustomerById(editId) : Promise.resolve(null),
  ]);

  const customers = table.items;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl tracking-tight">Customers</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Player IDs and zones you deliver to.
        </p>
        {isSuper && shopAdmins.length === 0 && (
          <p className="mt-3 text-sm border border-border rounded-md p-3 bg-muted/50 text-foreground">
            Create at least one shop admin under{" "}
            <Link href="/admin/shop-admins" className="underline font-medium">
              Shop admins
            </Link>{" "}
            before adding customers.
          </p>
        )}
      </div>

      <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            {editing ? "Edit customer" : "Add customer"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form
              key={editing.id}
              action={updateCustomer.bind(null, editing.id)}
              className="grid gap-4 sm:grid-cols-2 max-w-2xl"
            >
              <div className="space-y-2">
                <Label htmlFor="ingameId">Ingame ID</Label>
                <Input
                  id="ingameId"
                  name="ingameId"
                  defaultValue={editing.ingameId}
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoneId">Zone ID</Label>
                <Input
                  id="zoneId"
                  name="zoneId"
                  defaultValue={editing.zoneId}
                  required
                  className="bg-background"
                />
              </div>
              {isSuper && shopAdmins.length > 0 && (
                <div className="space-y-2 sm:col-span-2 max-w-md">
                  <Label htmlFor="shopAdminUserId">Shop admin</Label>
                  <select
                    id="shopAdminUserId"
                    name="shopAdminUserId"
                    defaultValue={editing.shopAdminUserId}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                    required
                  >
                    {shopAdmins.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">Save</Button>
                <Link
                  href="/customers"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Cancel
                </Link>
              </div>
            </form>
          ) : (
            <form
              key="new"
              action={createCustomer}
              className="grid gap-4 sm:grid-cols-2 max-w-2xl"
            >
              <div className="space-y-2">
                <Label htmlFor="ingameId">Ingame ID</Label>
                <Input
                  id="ingameId"
                  name="ingameId"
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoneId">Zone ID</Label>
                <Input id="zoneId" name="zoneId" required className="bg-background" />
              </div>
              {isSuper && shopAdmins.length > 0 && (
                <div className="space-y-2 sm:col-span-2 max-w-md">
                  <Label htmlFor="shopAdminUserId">Assign to shop admin</Label>
                  <select
                    id="shopAdminUserId"
                    name="shopAdminUserId"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                    required
                  >
                    <option value="">Select…</option>
                    {shopAdmins.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="sm:col-span-2">
                <Button type="submit">Add customer</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">All customers</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingame ID</TableHead>
                <TableHead>Zone ID</TableHead>
                {isSuper && <TableHead>Shop admin</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isSuper ? 4 : 3} className="text-muted-foreground">
                    No customers yet.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.ingameId}</TableCell>
                    <TableCell>{c.zoneId}</TableCell>
                    {isSuper && (
                      <TableCell className="text-muted-foreground text-sm">
                        {(c as { shopAdmin?: { email: string } }).shopAdmin?.email ??
                          "—"}
                      </TableCell>
                    )}
                    <TableCell className="text-right space-x-2">
                      <Link
                        href={`/customers?edit=${c.id}&page=${table.page}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Edit
                      </Link>
                      <form
                        action={deleteCustomer.bind(null, c.id)}
                        className="inline"
                      >
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
            pathname="/customers"
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
