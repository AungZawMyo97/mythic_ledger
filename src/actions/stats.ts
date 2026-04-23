"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const customerWhere = { shopAdminUserId: session.user.id };
  const orderWhere = { customer: { shopAdminUserId: session.user.id } };

  const [customerCount, orderCount, profitAgg] = await Promise.all([
    prisma.customer.count({ where: customerWhere }),
    prisma.order.count({ where: orderWhere }),
    prisma.order.aggregate({
      where: orderWhere,
      _sum: { netProfit: true },
    }),
  ]);

  return {
    customerCount,
    orderCount,
    netProfitTotal: profitAgg._sum.netProfit?.toFixed(2) ?? "0.00",
  };
}
