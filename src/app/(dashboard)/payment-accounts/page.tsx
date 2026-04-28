import {
  listPaymentAccounts,
  upsertPaymentAccount,
  deletePaymentAccount,
} from "@/actions/payment-accounts";
import {
  PUBLIC_PAYMENT_METHODS,
  PUBLIC_PAYMENT_LABELS,
  type PublicPaymentMethod,
} from "@/lib/public-payment";
import { Button } from "@/components/ui/button";
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
import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export default async function PaymentAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const sp = await searchParams;
  const editMethod = sp.edit as PublicPaymentMethod | undefined;

  const accounts = await listPaymentAccounts();

  const editingAccount =
    editMethod && PUBLIC_PAYMENT_METHODS.includes(editMethod)
      ? accounts[editMethod]
      : null;

  const isEditing = editMethod && PUBLIC_PAYMENT_METHODS.includes(editMethod);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl tracking-tight">
          Payment accounts
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure account name and number for each payment method shown to
          customers.
        </p>
      </div>

      <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            {isEditing
              ? `Edit ${PUBLIC_PAYMENT_LABELS[editMethod!]} account`
              : "Add / update account"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            key={editMethod ?? "new"}
            action={upsertPaymentAccount}
            className="grid gap-4 max-w-md"
          >
            <div className="space-y-2">
              <Label htmlFor="method">Payment method</Label>
              {isEditing ? (
                <>
                  <Input
                    id="methodDisplay"
                    value={PUBLIC_PAYMENT_LABELS[editMethod!]}
                    disabled
                    className="bg-muted"
                  />
                  <input type="hidden" name="method" value={editMethod} />
                </>
              ) : (
                <select
                  id="method"
                  name="method"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  <option value="">Select...</option>
                  {PUBLIC_PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {PUBLIC_PAYMENT_LABELS[m]}
                      {accounts[m] ? " (update existing)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Account name</Label>
              <Input
                id="accountName"
                name="accountName"
                required
                defaultValue={editingAccount?.accountName ?? ""}
                placeholder="e.g. Aung Zaw Myo"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account number</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                required
                defaultValue={editingAccount?.accountNumber ?? ""}
                placeholder="e.g. 09123456789"
                className="bg-background"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {isEditing ? "Save" : "Save account"}
              </Button>
              {isEditing && (
                <Link
                  href="/payment-accounts"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Cancel
                </Link>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Configured accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment method</TableHead>
                <TableHead>Account name</TableHead>
                <TableHead>Account number</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PUBLIC_PAYMENT_METHODS.every((m) => !accounts[m]) ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No payment accounts configured yet.
                  </TableCell>
                </TableRow>
              ) : (
                PUBLIC_PAYMENT_METHODS.map((method) => {
                  const account = accounts[method];
                  if (!account) return null;

                  return (
                    <TableRow key={method}>
                      <TableCell className="font-medium">
                        {PUBLIC_PAYMENT_LABELS[method]}
                      </TableCell>
                      <TableCell>{account.accountName}</TableCell>
                      <TableCell className="tabular-nums">
                        {account.accountNumber}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link
                          href={`/payment-accounts?edit=${method}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                          )}
                        >
                          Edit
                        </Link>
                        <form
                          action={deletePaymentAccount.bind(null, method)}
                          className="inline"
                        >
                          <Button
                            size="sm"
                            variant="destructive"
                            type="submit"
                          >
                            Delete
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
