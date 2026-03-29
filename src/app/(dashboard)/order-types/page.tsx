import Link from "next/link";
import { auth } from "@/auth";
import {
  createOrderType,
  deleteOrderType,
  getOrderTypeById,
  listOrderTypesPaginated,
  updateOrderType,
} from "@/actions/order-types";
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
import { redirect } from "next/navigation";

export default async function OrderTypesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const sp = await searchParams;
  const editId = sp.edit;
  const page = parsePage(sp.page);

  const [table, editing] = await Promise.all([
    listOrderTypesPaginated(page, DEFAULT_PAGE_SIZE),
    editId ? getOrderTypeById(editId) : Promise.resolve(null),
  ]);

  const types = table.items;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl tracking-tight">Order types</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Labels for diamond packs or bundles (e.g. &quot;86 + 8&quot;, &quot;Weekly pass&quot;).
        </p>
      </div>

      <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            {editing ? "Edit type" : "Add type"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form
              action={updateOrderType.bind(null, editing.id)}
              className="grid gap-4 max-w-md"
            >
              <div className="space-y-2">
                <Label htmlFor="type">Label</Label>
                <Input
                  id="type"
                  name="type"
                  defaultValue={editing.type}
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <select
                  id="isActive"
                  name="isActive"
                  defaultValue={editing.isActive ? "true" : "false"}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Link
                  href="/order-types"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Cancel
                </Link>
              </div>
            </form>
          ) : (
            <form action={createOrderType} className="grid gap-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="type">Label</Label>
                <Input id="type" name="type" required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <select
                  id="isActive"
                  name="isActive"
                  defaultValue="true"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <Button type="submit">Add type</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">All types</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No order types yet.
                  </TableCell>
                </TableRow>
              ) : (
                types.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.type}</TableCell>
                    <TableCell>{t.isActive ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link
                        href={`/order-types?edit=${t.id}&page=${table.page}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Edit
                      </Link>
                      <form action={deleteOrderType.bind(null, t.id)} className="inline">
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
            pathname="/order-types"
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
