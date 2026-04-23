"use server";

import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PAGE_SIZE, getPaginationMeta } from "@/lib/pagination";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseMoney(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  try {
    return new Prisma.Decimal(text);
  } catch {
    return null;
  }
}

export async function listOrderTypesPaginated(
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const total = await prisma.orderType.count();
  const meta = getPaginationMeta(total, page, pageSize);

  const items = await prisma.orderType.findMany({
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

export async function getOrderTypeById(id: string) {
  const session = await auth();
  if (!session?.user) return null;
  return prisma.orderType.findUnique({ where: { id } });
}

export async function listOrderTypesActive() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.orderType.findMany({
    where: { isActive: true },
    orderBy: { type: "asc" },
  });
}

export async function createOrderType(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const type = String(formData.get("type") ?? "").trim();
  const buyingPrice = parseMoney(formData.get("buyingPrice"));
  const sellingPrice = parseMoney(formData.get("sellingPrice"));

  if (!type || buyingPrice === null || sellingPrice === null) {
    redirect("/order-types?error=fields");
  }

  const isActive = String(formData.get("isActive") ?? "true") !== "false";

  await prisma.orderType.create({
    data: {
      type,
      buyingPrice,
      sellingPrice,
      isActive,
    },
  });

  revalidatePath("/order-types");
  redirect("/order-types");
}

export async function updateOrderType(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const type = String(formData.get("type") ?? "").trim();
  const buyingPrice = parseMoney(formData.get("buyingPrice"));
  const sellingPrice = parseMoney(formData.get("sellingPrice"));

  if (!type || buyingPrice === null || sellingPrice === null) {
    redirect(`/order-types?edit=${id}&error=fields`);
  }

  const isActive = String(formData.get("isActive") ?? "true") !== "false";

  await prisma.orderType.update({
    where: { id },
    data: {
      type,
      buyingPrice,
      sellingPrice,
      isActive,
    },
  });

  revalidatePath("/order-types");
  redirect("/order-types");
}

export async function deleteOrderType(id: string) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const used = await prisma.order.count({ where: { orderTypeId: id } });
  if (used > 0) {
    redirect("/order-types?error=inuse");
  }

  await prisma.orderType.delete({ where: { id } });
  revalidatePath("/order-types");
  redirect("/order-types");
}
