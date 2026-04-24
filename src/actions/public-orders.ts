"use server";

import { prisma } from "@/lib/prisma";
import {
  EMPTY_PUBLIC_PAYMENT_ACCOUNTS,
  type PublicPaymentMethod,
  isPublicPaymentMethod,
} from "@/lib/public-payment";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function listPublicOrderPackages() {
  const packages = await prisma.orderType.findMany({
    where: { isActive: true },
    orderBy: { type: "asc" },
    select: { id: true, type: true, sellingPrice: true },
  });

  return packages.map((pkg) => ({
    id: pkg.id,
    type: pkg.type,
    sellingPrice: pkg.sellingPrice.toString(),
  }));
}

export async function listPublicPaymentAccounts() {
  const accounts = await prisma.publicPaymentAccount.findMany({
    select: { method: true, accountName: true, accountNumber: true },
  });

  const byMethod = { ...EMPTY_PUBLIC_PAYMENT_ACCOUNTS };
  for (const account of accounts) {
    byMethod[account.method as PublicPaymentMethod] = {
      name: account.accountName.trim(),
      number: account.accountNumber.trim(),
    };
  }

  return byMethod;
}

export async function createPublicOrder(formData: FormData) {
  const orderTypeId = clean(formData.get("orderTypeId"));
  const ingameId = clean(formData.get("ingameId"));
  const zoneId = clean(formData.get("zoneId"));
  const paymentMethodRaw = clean(formData.get("paymentMethod"));
  const transactionId = clean(formData.get("transactionId"));

  if (!orderTypeId || !ingameId || !zoneId || !paymentMethodRaw || !transactionId) {
    redirect("/?error=missing");
  }

  if (!isPublicPaymentMethod(paymentMethodRaw)) {
    redirect("/?error=payment");
  }

  const orderType = await prisma.orderType.findFirst({
    where: { id: orderTypeId, isActive: true },
    select: { id: true },
  });

  if (!orderType) {
    redirect("/?error=package");
  }

  const paymentAccount = await prisma.publicPaymentAccount.findUnique({
    where: { method: paymentMethodRaw },
    select: { accountName: true, accountNumber: true },
  });

  const paymentAccountNameSnapshot = paymentAccount?.accountName.trim() ?? "";
  const paymentNumberSnapshot = paymentAccount?.accountNumber.trim() ?? "";

  if (!paymentAccountNameSnapshot || !paymentNumberSnapshot) {
    redirect("/?error=paynumber");
  }

  await prisma.publicOrder.create({
    data: {
      orderTypeId: orderType.id,
      ingameId,
      zoneId,
      paymentMethod: paymentMethodRaw,
      paymentAccountNameSnapshot,
      paymentNumberSnapshot,
      transactionId,
    },
  });

  revalidatePath("/");
  redirect("/?success=1");
}
