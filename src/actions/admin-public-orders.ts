"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PAGE_SIZE, getPaginationMeta } from "@/lib/pagination";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type PublicOrderStatus } from "@/generated/prisma";

export async function listAdminPublicOrdersPaginated(
  page: number,
  statusFilter?: PublicOrderStatus,
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where = statusFilter ? { status: statusFilter } : {};

  const total = await prisma.publicOrder.count({ where });
  const meta = getPaginationMeta(total, page, pageSize);

  const items = await prisma.publicOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: meta.skip,
    take: pageSize,
    include: {
      orderType: true,
    },
  });

  return {
    items,
    total,
    page: meta.currentPage,
    pageSize,
    totalPages: meta.totalPages,
  };
}

export async function confirmPublicOrder(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const publicOrder = await prisma.publicOrder.findUnique({
    where: { id },
    include: { orderType: true },
  });

  if (!publicOrder) redirect("/public-orders?error=missing");
  if (publicOrder.status !== "PENDING") {
    redirect("/public-orders?error=invalid_status");
  }

  // 1. Find or create the Customer
  let customer = await prisma.customer.findFirst({
    where: {
      ingameId: publicOrder.ingameId,
      zoneId: publicOrder.zoneId,
      shopAdminUserId: session.user.id,
    },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        ingameId: publicOrder.ingameId,
        zoneId: publicOrder.zoneId,
        shopAdminUserId: session.user.id,
      },
    });
  }

  // 2. Create the real Order
  const netProfit = publicOrder.orderType.sellingPrice.minus(
    publicOrder.orderType.buyingPrice
  );

  await prisma.$transaction([
    prisma.order.create({
      data: {
        customerId: customer.id,
        orderTypeId: publicOrder.orderType.id,
        orderDate: new Date(),
        buyingPrice: publicOrder.orderType.buyingPrice,
        sellingPrice: publicOrder.orderType.sellingPrice,
        netProfit,
      },
    }),
    prisma.publicOrder.update({
      where: { id },
      data: { status: "CONFIRMED" },
    }),
  ]);

  revalidatePath("/public-orders");
  revalidatePath("/orders");
  revalidatePath("/customers");
  redirect("/public-orders");
}

export async function rejectPublicOrder(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const publicOrder = await prisma.publicOrder.findUnique({
    where: { id },
  });

  if (!publicOrder) redirect("/public-orders?error=missing");
  if (publicOrder.status !== "PENDING") {
    redirect("/public-orders?error=invalid_status");
  }

  await prisma.publicOrder.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  revalidatePath("/public-orders");
  redirect("/public-orders");
}
