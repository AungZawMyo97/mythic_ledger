"use server";

import { prisma } from "@/lib/prisma";
import {
  getPublicPaymentNumbers,
  isPublicPaymentMethod,
} from "@/lib/public-payment";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function listPublicOrderPackages() {
  return prisma.orderType.findMany({
    where: { isActive: true },
    orderBy: { type: "asc" },
    select: { id: true, type: true, sellingPrice: true },
  });
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

  const paymentNumbers = getPublicPaymentNumbers();
  const paymentNumberSnapshot = paymentNumbers[paymentMethodRaw];
  if (!paymentNumberSnapshot) {
    redirect("/?error=paynumber");
  }

  await prisma.publicOrder.create({
    data: {
      orderTypeId: orderType.id,
      ingameId,
      zoneId,
      paymentMethod: paymentMethodRaw,
      paymentNumberSnapshot,
      transactionId,
    },
  });

  revalidatePath("/");
  redirect("/?success=1");
}
