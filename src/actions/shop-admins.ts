"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PAGE_SIZE, getPaginationMeta } from "@/lib/pagination";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const DEFAULT_PW =
  process.env.DEFAULT_SHOP_ADMIN_PASSWORD ?? "ChangeMe123!";

export async function listShopAdminsForSelect() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return [];
  }

  return prisma.user.findMany({
    where: { role: "SHOP_ADMIN" },
    select: { id: true, email: true },
    orderBy: { email: "asc" },
  });
}

export async function listShopAdminsPaginated(
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }

  const total = await prisma.user.count({ where: { role: "SHOP_ADMIN" } });
  const meta = getPaginationMeta(total, page, pageSize);

  const items = await prisma.user.findMany({
    where: { role: "SHOP_ADMIN" },
    orderBy: { createdAt: "desc" },
    skip: meta.skip,
    take: pageSize,
    select: {
      id: true,
      email: true,
      mustChangePassword: true,
      createdAt: true,
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

export async function createShopAdmin(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  if (!email) {
    redirect("/admin/shop-admins?error=email");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/admin/shop-admins?error=exists");
  }

  const passwordHash = await hash(DEFAULT_PW, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "SHOP_ADMIN",
      mustChangePassword: true,
    },
  });

  revalidatePath("/admin/shop-admins");
  redirect("/admin/shop-admins?created=1");
}
