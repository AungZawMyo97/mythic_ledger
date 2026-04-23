"use client";

import { createPublicOrder } from "@/actions/public-orders";
import {
  PUBLIC_PAYMENT_LABELS,
  PUBLIC_PAYMENT_METHODS,
  type PublicPaymentMethod,
} from "@/lib/public-payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";

type PublicOrderFormProps = {
  packages: Array<{ id: string; type: string; sellingPrice: { toString(): string } }>;
  paymentNumbers: Record<PublicPaymentMethod, string>;
};

export function PublicOrderForm({ packages, paymentNumbers }: PublicOrderFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PublicPaymentMethod>("KPAY");
  const txIdRef = useRef<HTMLInputElement>(null);

  const selectedNumber = paymentNumbers[paymentMethod];

  return (
    <form
      action={createPublicOrder}
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(event) => {
        const txId = window.prompt(
          `Please enter your ${PUBLIC_PAYMENT_LABELS[paymentMethod]} transaction ID.`,
          "",
        );
        if (!txId || !txId.trim()) {
          event.preventDefault();
          return;
        }
        if (txIdRef.current) {
          txIdRef.current.value = txId.trim();
        }
      }}
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
              {pkg.type} - {pkg.sellingPrice.toString()}
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
        <p className="font-medium">{PUBLIC_PAYMENT_LABELS[paymentMethod]} number</p>
        <p className="mt-1 text-muted-foreground">{selectedNumber || "Not configured yet"}</p>
      </div>

      <input ref={txIdRef} type="hidden" name="transactionId" />

      <div className="md:col-span-2">
        <Button type="submit" className="w-full sm:w-auto" disabled={packages.length === 0}>
          Place order
        </Button>
      </div>
    </form>
  );
}
