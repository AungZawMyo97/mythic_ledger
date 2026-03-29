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

  if (session.user.role === "SUPER_ADMIN") {
    return prisma.customer.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        shopAdmin: { select: { email: true } },
      },
    });
  }

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

  const where =
    session.user.role === "SUPER_ADMIN"
      ? undefined
      : { shopAdminUserId: session.user.id };

  const total = await prisma.customer.count({ where });

  const meta = getPaginationMeta(total, page, pageSize);

  const items = await prisma.customer.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: meta.skip,
    take: pageSize,
    include:
      session.user.role === "SUPER_ADMIN"
        ? { shopAdmin: { select: { email: true } } }
        : undefined,
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
    include: { shopAdmin: { select: { email: true } } },
  });
  if (!row) return null;
  if (
    session.user.role !== "SUPER_ADMIN" &&
    row.shopAdminUserId !== session.user.id
  ) {
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

  let ownerId = session.user.id;
  if (session.user.role === "SUPER_ADMIN") {
    const assignTo = String(formData.get("shopAdminUserId") ?? "").trim();
    if (!assignTo) {
      redirect("/customers?error=shop");
    }
    ownerId = assignTo;
  }

  await prisma.customer.create({
    data: {
      ingameId,
      zoneId,
      shopAdminUserId: ownerId,
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
  if (
    session.user.role !== "SUPER_ADMIN" &&
    existing.shopAdminUserId !== session.user.id
  ) {
    redirect("/customers?error=forbidden");
  }

  const ingameId = String(formData.get("ingameId") ?? "").trim();
  const zoneId = String(formData.get("zoneId") ?? "").trim();
  if (!ingameId || !zoneId) {
    redirect(`/customers?edit=${id}&error=fields`);
  }

  const data: { ingameId: string; zoneId: string; shopAdminUserId?: string } =
    { ingameId, zoneId };

  if (session.user.role === "SUPER_ADMIN") {
    const assignTo = String(formData.get("shopAdminUserId") ?? "").trim();
    if (assignTo) data.shopAdminUserId = assignTo;
  }

  await prisma.customer.update({
    where: { id },
    data,
  });

  revalidatePath("/customers");
  redirect("/customers");
}

export async function deleteCustomer(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) redirect("/customers?error=missing");
  if (
    session.user.role !== "SUPER_ADMIN" &&
    existing.shopAdminUserId !== session.user.id
  ) {
    redirect("/customers?error=forbidden");
  }

  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
  redirect("/customers");
}
