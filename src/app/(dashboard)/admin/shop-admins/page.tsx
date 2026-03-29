import { auth } from "@/auth";
import { createShopAdmin, listShopAdminsPaginated } from "@/actions/shop-admins";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/table-pagination";
import { DEFAULT_PAGE_SIZE, parsePage } from "@/lib/pagination";
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

export default async function ShopAdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const sp = await searchParams;
  const page = parsePage(sp.page);
  const table = await listShopAdminsPaginated(page, DEFAULT_PAGE_SIZE);
  const admins = table.items;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl tracking-tight">Shop admins</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Create accounts for staff. They sign in with the default password, then set their own.
        </p>
      </div>

      <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">New shop admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createShopAdmin} className="flex flex-col sm:flex-row gap-4 max-w-xl items-end">
            <div className="space-y-2 flex-1 w-full">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="staff@yourshop.com"
                className="bg-background"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Create account
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">
            Default password comes from{" "}
            <code className="text-foreground bg-muted px-1 rounded">DEFAULT_SHOP_ADMIN_PASSWORD</code>{" "}
            in your environment. Change it before inviting staff.
          </p>
        </CardContent>
      </Card>

      <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Accounts</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Must change password</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No shop admins yet.
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.email}</TableCell>
                    <TableCell>{a.mustChangePassword ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {a.createdAt.toISOString().slice(0, 10)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            pathname="/admin/shop-admins"
            page={table.page}
            totalPages={table.totalPages}
            total={table.total}
          />
        </CardContent>
      </Card>
    </div>
  );
}
