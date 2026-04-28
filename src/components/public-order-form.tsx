"use client";

import { createPublicOrder } from "@/actions/public-orders";
import {
  type PublicPaymentAccountInfo,
  PUBLIC_PAYMENT_LABELS,
  PUBLIC_PAYMENT_METHODS,
  type PublicPaymentMethod,
} from "@/lib/public-payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRef, useState } from "react";

type PublicOrderFormProps = {
  packages: Array<{ id: string; type: string; sellingPrice: string }>;
  paymentAccounts: Record<PublicPaymentMethod, PublicPaymentAccountInfo>;
};

export function PublicOrderForm({ packages, paymentAccounts }: PublicOrderFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PublicPaymentMethod>("KPAY");
  const [showTxDialog, setShowTxDialog] = useState(false);
  const [txIdValue, setTxIdValue] = useState("");
  const [txError, setTxError] = useState("");
  const txIdRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const selectedAccount = paymentAccounts[paymentMethod];

  function handlePlaceOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTxIdValue("");
    setTxError("");
    setShowTxDialog(true);
  }

  function handleConfirmTx() {
    const trimmed = txIdValue.trim();
    if (!trimmed) {
      setTxError("Transaction ID is required.");
      return;
    }
    if (txIdRef.current) {
      txIdRef.current.value = trimmed;
    }
    setShowTxDialog(false);
    // Submit the form programmatically after setting the hidden value
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form
        ref={formRef}
        action={createPublicOrder}
        className="grid gap-4 md:grid-cols-2"
        onSubmit={handlePlaceOrder}
      >
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="orderTypeId">Choose package</Label>
          <select
            id="orderTypeId"
            name="orderTypeId"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs"
          >
            <option value="">Select package...</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.type} - {pkg.sellingPrice}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ingameId">In-game ID</Label>
          <Input id="ingameId" name="ingameId" required placeholder="Enter your in-game ID" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zoneId">Zone ID</Label>
          <Input id="zoneId" name="zoneId" required placeholder="Enter your zone ID" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="paymentMethod">Payment method</Label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            required
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as PublicPaymentMethod)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs"
          >
            {PUBLIC_PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {PUBLIC_PAYMENT_LABELS[method]}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm md:col-span-2">
          <p className="font-medium">{PUBLIC_PAYMENT_LABELS[paymentMethod]} account</p>
          {selectedAccount.name && selectedAccount.number ? (
            <div className="mt-1 space-y-1 text-muted-foreground">
              <p>Name: {selectedAccount.name}</p>
              <p>Number: {selectedAccount.number}</p>
            </div>
          ) : (
            <p className="mt-1 text-muted-foreground">Not configured yet</p>
          )}
        </div>

        <input ref={txIdRef} type="hidden" name="transactionId" />

        <div className="md:col-span-2">
          <Button type="submit" className="w-full sm:w-auto" disabled={packages.length === 0}>
            Place order
          </Button>
        </div>
      </form>

      <Dialog open={showTxDialog} onOpenChange={setShowTxDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction ID</DialogTitle>
            <DialogDescription>
              Please enter your {PUBLIC_PAYMENT_LABELS[paymentMethod]} transaction ID to confirm your order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="txIdInput">Transaction ID</Label>
            <Input
              id="txIdInput"
              placeholder="e.g. TXN123456789"
              autoFocus
              value={txIdValue}
              onChange={(e) => {
                setTxIdValue(e.target.value);
                if (txError) setTxError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleConfirmTx();
                }
              }}
            />
            {txError && (
              <p className="text-sm text-destructive">{txError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTxDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmTx}>
              Confirm order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
