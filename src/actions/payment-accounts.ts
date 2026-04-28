"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  PUBLIC_PAYMENT_METHODS,
  type PublicPaymentMethod,
} from "@/lib/public-payment";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function listPaymentAccounts() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const rows = await prisma.publicPaymentAccount.findMany({
    orderBy: { method: "asc" },
  });

  // Return a record keyed by method for easy lookup
  const map: Record<string, (typeof rows)[number] | null> = {};
  for (const method of PUBLIC_PAYMENT_METHODS) {
    map[method] = rows.find((r) => r.method === method) ?? null;
  }
  return map;
}

export async function upsertPaymentAccount(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const method = String(formData.get("method") ?? "").trim();
  const accountName = String(formData.get("accountName") ?? "").trim();
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();

  if (
    !method ||
    !PUBLIC_PAYMENT_METHODS.includes(method as PublicPaymentMethod)
  ) {
    redirect("/payment-accounts?error=method");
  }

  if (!accountName || !accountNumber) {
    redirect("/payment-accounts?error=fields");
  }

  await prisma.publicPaymentAccount.upsert({
    where: { method: method as PublicPaymentMethod },
    update: { accountName, accountNumber },
    create: {
      method: method as PublicPaymentMethod,
      accountName,
      accountNumber,
    },
  });

  revalidatePath("/payment-accounts");
  redirect("/payment-accounts");
}

export async function deletePaymentAccount(method: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!PUBLIC_PAYMENT_METHODS.includes(method as PublicPaymentMethod)) {
    redirect("/payment-accounts?error=method");
  }

  await prisma.publicPaymentAccount.deleteMany({
    where: { method: method as PublicPaymentMethod },
  });

  revalidatePath("/payment-accounts");
  redirect("/payment-accounts");
}
