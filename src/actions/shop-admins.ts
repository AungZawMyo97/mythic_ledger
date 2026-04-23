"use server";

import { auth } from "@/auth";
import { DEFAULT_PAGE_SIZE, getPaginationMeta } from "@/lib/pagination";
import { redirect } from "next/navigation";

export async function listShopAdminsForSelect() {
  return [];
}

export async function listShopAdminsPaginated(
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  if (!page || !pageSize) {
    throw new Error("Invalid pagination input.");
  }

  const session = await auth();
  if (!session?.user) {
    throw new Error("Forbidden");
  }
  const meta = getPaginationMeta(0, page, pageSize);

  return {
    items: [] as Array<{
      id: string;
      email: string;
      mustChangePassword: boolean;
      createdAt: Date;
    }>,
    total: 0,
    page: meta.currentPage,
    pageSize,
    totalPages: meta.totalPages,
  };
}

export async function createShopAdmin(formData: FormData) {
  void formData;
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  redirect("/dashboard");
}
