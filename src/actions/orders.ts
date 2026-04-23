"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseOrderDateFromForm } from "@/lib/datetime-input";
import { DEFAULT_PAGE_SIZE, getPaginationMeta } from "@/lib/pagination";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function assertCustomerAccess(customerId: string, userId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer) return { error: "Customer not found." as const };
  if (customer.shopAdminUserId !== userId) {
    return { error: "Forbidden." as const };
  }
  return { customer };
}

async function getOrderTypePrices(orderTypeId: string) {
  const orderType = await prisma.orderType.findUnique({
    where: { id: orderTypeId },
    select: { buyingPrice: true, sellingPrice: true },
  });
  if (!orderType) return null;
  return orderType;
}

export async function listOrdersPaginated(
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where = { customer: { shopAdminUserId: session.user.id } };

  const total = await prisma.order.count({ where });
  const meta = getPaginationMeta(total, page, pageSize);

  const items = await prisma.order.findMany({
    where,
    orderBy: [{ orderDate: "desc" }, { createdAt: "desc" }],
    skip: meta.skip,
    take: pageSize,
    include: {
      customer: true,
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

export async function getOrderById(id: string) {
  const session = await auth();
  if (!session?.user) return null;

  const row = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, orderType: true },
  });
  if (!row) return null;
  if (row.customer.shopAdminUserId !== session.user.id) {
    return null;
  }
  return row;
}

export async function createOrder(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const customerId = String(formData.get("customerId") ?? "");
  const orderTypeId = String(formData.get("orderTypeId") ?? "");
  const orderDate = parseOrderDateFromForm(
    String(formData.get("orderDate") ?? ""),
  );

  if (!customerId || !orderTypeId) {
    redirect("/orders?error=fields");
  }

  const access = await assertCustomerAccess(customerId, session.user.id);
  if ("error" in access) {
    redirect("/orders?error=forbidden");
  }

  const prices = await getOrderTypePrices(orderTypeId);
  if (!prices) {
    redirect("/orders?error=type");
  }

  const netProfit = prices.sellingPrice.minus(prices.buyingPrice);

  await prisma.order.create({
    data: {
      customerId,
      orderTypeId,
      orderDate,
      buyingPrice: prices.buyingPrice,
      sellingPrice: prices.sellingPrice,
      netProfit,
    },
  });

  revalidatePath("/orders");
  redirect("/orders");
}

export async function updateOrder(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { customer: true },
  });
  if (!existing) redirect("/orders?error=missing");
  if (existing.customer.shopAdminUserId !== session.user.id) {
    redirect("/orders?error=forbidden");
  }

  const customerId = String(formData.get("customerId") ?? "");
  const orderTypeId = String(formData.get("orderTypeId") ?? "");
  const orderDate = parseOrderDateFromForm(
    String(formData.get("orderDate") ?? ""),
  );

  if (!customerId || !orderTypeId) {
    redirect(`/orders?edit=${id}&error=fields`);
  }

  const access = await assertCustomerAccess(customerId, session.user.id);
  if ("error" in access) {
    redirect(`/orders?edit=${id}&error=forbidden`);
  }

  const prices = await getOrderTypePrices(orderTypeId);
  if (!prices) {
    redirect(`/orders?edit=${id}&error=type`);
  }

  const netProfit = prices.sellingPrice.minus(prices.buyingPrice);

  await prisma.order.update({
    where: { id },
    data: {
      customerId,
      orderTypeId,
      orderDate,
      buyingPrice: prices.buyingPrice,
      sellingPrice: prices.sellingPrice,
      netProfit,
    },
  });

  revalidatePath("/orders");
  redirect("/orders");
}

export async function deleteOrder(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { customer: true },
  });
  if (!existing) redirect("/orders?error=missing");
  if (existing.customer.shopAdminUserId !== session.user.id) {
    redirect("/orders?error=forbidden");
  }

  await prisma.order.delete({ where: { id } });
  revalidatePath("/orders");
  redirect("/orders");
}
