import Link from "next/link";
import {
  listPublicOrderPackages,
  listPublicPaymentAccounts,
} from "@/actions/public-orders";
import { PublicOrderForm } from "@/components/public-order-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

const errorMessages: Record<string, string> = {
  missing: "Please fill in all required fields.",
  payment: "Invalid payment method.",
  package: "The selected package is unavailable.",
  paynumber: "Payment number is not configured yet.",
};

export default async function PublicOrderHomePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const [sp, packages, paymentAccounts] = await Promise.all([
    searchParams,
    listPublicOrderPackages(),
    listPublicPaymentAccounts(),
  ]);
  const error = sp.error ? errorMessages[sp.error] : null;
  const showSuccess = sp.success === "1";

  return (
    <main className="min-h-screen bg-linear-to-b from-background to-muted/40 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="font-heading text-3xl tracking-tight">
              MLBB Diamond Order
            </h1>
            <p className="text-sm text-muted-foreground">
              Select package, enter your game ID and zone, choose payment, and
              submit your transaction ID.
            </p>
          </div>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "shrink-0",
            )}
          >
            Admin login
          </Link>
        </div>

        {showSuccess && (
          <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Order submitted successfully. We recorded your transaction ID.
          </div>
        )}

        {error && (
          <div className="rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        <Card className="border-2 shadow-[4px_4px_0_0_var(--border)]">
          <CardHeader>
            <CardTitle className="font-heading text-xl">
              Place your order
            </CardTitle>
          </CardHeader>
          <CardContent>
            {packages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active packages are available right now.
              </p>
            ) : (
              <PublicOrderForm
                packages={packages}
                paymentAccounts={paymentAccounts}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
