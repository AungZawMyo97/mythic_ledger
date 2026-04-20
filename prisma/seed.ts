import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required for seeding");
  }
  const email = process.env.SEED_SUPER_ADMIN_EMAIL;
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;
  if (!email?.trim() || !password) {
    console.warn(
      "Skipping seed: set SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD in .env",
    );
    return;
  }

  const prisma = new PrismaClient({ accelerateUrl: url } as any);

  const passwordHash = await hash(password, 12);

  await prisma.user.upsert({
    where: { email: email.toLowerCase().trim() },
    create: {
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "SUPER_ADMIN",
      mustChangePassword: false,
    },
    update: {},
  });

  console.log(`Super Admin ready: ${email.toLowerCase().trim()}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
