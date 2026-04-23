"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PAGE_SIZE,
  getPaginationMeta,
} from "@/lib/pagination";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function listCustomers() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.customer.findMany({
    where: { shopAdminUserId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listCustomersPaginated(
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where = { shopAdminUserId: session.user.id };

  const total = await prisma.customer.count({ where });

  const meta = getPaginationMeta(total, page, pageSize);

  const items = await prisma.customer.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: meta.skip,
    take: pageSize,
  });

  return {
    items,
    total,
    page: meta.currentPage,
    pageSize,
    totalPages: meta.totalPages,
  };
}

export async function getCustomerById(id: string) {
  const session = await auth();
  if (!session?.user) return null;

  const row = await prisma.customer.findUnique({
    where: { id },
  });
  if (!row) return null;
  if (row.shopAdminUserId !== session.user.id) {
    return null;
  }
  return row;
}

export async function createCustomer(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const ingameId = String(formData.get("ingameId") ?? "").trim();
  const zoneId = String(formData.get("zoneId") ?? "").trim();
  if (!ingameId || !zoneId) {
    redirect("/customers?error=fields");
  }

  await prisma.customer.create({
    data: {
      ingameId,
      zoneId,
      shopAdminUserId: session.user.id,
    },
  });

  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) redirect("/customers?error=missing");
  if (existing.shopAdminUserId !== session.user.id) {
    redirect("/customers?error=forbidden");
  }

  const ingameId = String(formData.get("ingameId") ?? "").trim();
  const zoneId = String(formData.get("zoneId") ?? "").trim();
  if (!ingameId || !zoneId) {
    redirect(`/customers?edit=${id}&error=fields`);
  }

  await prisma.customer.update({
    where: { id },
    data: { ingameId, zoneId },
  });

  revalidatePath("/customers");
  redirect("/customers");
}

export async function deleteCustomer(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) redirect("/customers?error=missing");
  if (existing.shopAdminUserId !== session.user.id) {
    redirect("/customers?error=forbidden");
  }

  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
  redirect("/customers");
}
