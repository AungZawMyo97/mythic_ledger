"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export type MonthlyProfitRow = {
  monthStart: Date;
  orderCount: number;
  totalBuy: Prisma.Decimal;
  totalSell: Prisma.Decimal;
  totalProfit: Prisma.Decimal;
};

export async function getMonthlyProfit(): Promise<MonthlyProfitRow[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;
  const isSuper = session.user.role === "SUPER_ADMIN";

  const rows = isSuper
    ? await prisma.$queryRaw<
        {
          month_start: Date;
          order_count: bigint;
          total_buy: Prisma.Decimal;
          total_sell: Prisma.Decimal;
          total_profit: Prisma.Decimal;
        }[]
      >(Prisma.sql`
        SELECT
          date_trunc('month', o."orderDate") AS month_start,
          COUNT(*)::bigint AS order_count,
          COALESCE(SUM(o."buyingPrice"), 0) AS total_buy,
          COALESCE(SUM(o."sellingPrice"), 0) AS total_sell,
          COALESCE(SUM(o."netProfit"), 0) AS total_profit
        FROM "Order" o
        INNER JOIN "Customer" c ON o."customerId" = c.id
        GROUP BY date_trunc('month', o."orderDate")
        ORDER BY month_start DESC
      `)
    : await prisma.$queryRaw<
        {
          month_start: Date;
          order_count: bigint;
          total_buy: Prisma.Decimal;
          total_sell: Prisma.Decimal;
          total_profit: Prisma.Decimal;
        }[]
      >(Prisma.sql`
        SELECT
          date_trunc('month', o."orderDate") AS month_start,
          COUNT(*)::bigint AS order_count,
          COALESCE(SUM(o."buyingPrice"), 0) AS total_buy,
          COALESCE(SUM(o."sellingPrice"), 0) AS total_sell,
          COALESCE(SUM(o."netProfit"), 0) AS total_profit
        FROM "Order" o
        INNER JOIN "Customer" c ON o."customerId" = c.id
        WHERE c."shopAdminUserId" = ${userId}
        GROUP BY date_trunc('month', o."orderDate")
        ORDER BY month_start DESC
      `);

  return rows.map((r) => ({
    monthStart: r.month_start,
    orderCount: Number(r.order_count),
    totalBuy: r.total_buy,
    totalSell: r.total_sell,
    totalProfit: r.total_profit,
  }));
}
