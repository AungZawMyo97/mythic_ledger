"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PAGE_SIZE, getPaginationMeta } from "@/lib/pagination";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function listOrderTypesPaginated(
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (session.user.role !== "SUPER_ADMIN") {
    throw new Error("Only Super Admin can manage order types.");
  }

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
  if (!session?.user || session.user.role !== "SUPER_ADMIN") return null;
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
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const type = String(formData.get("type") ?? "").trim();
  if (!type) redirect("/order-types?error=type");

  const isActive = String(formData.get("isActive") ?? "true") !== "false";

  await prisma.orderType.create({
    data: {
      type,
      isActive,
    },
  });

  revalidatePath("/order-types");
  redirect("/order-types");
}

export async function updateOrderType(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const type = String(formData.get("type") ?? "").trim();
  if (!type) redirect(`/order-types?edit=${id}&error=type`);

  const isActive = String(formData.get("isActive") ?? "true") !== "false";

  await prisma.orderType.update({
    where: { id },
    data: {
      type,
      isActive,
    },
  });

  revalidatePath("/order-types");
  redirect("/order-types");
}

export async function deleteOrderType(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const used = await prisma.order.count({ where: { orderTypeId: id } });
  if (used > 0) {
    redirect("/order-types?error=inuse");
  }

  await prisma.orderType.delete({ where: { id } });
  revalidatePath("/order-types");
  redirect("/order-types");
}
