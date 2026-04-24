import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { getRequiredEnv } from "../src/lib/env";

async function main() {
  const url = getRequiredEnv("DATABASE_URL");
  const email = process.env.SEED_SUPER_ADMIN_EMAIL;
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;
  if (!email?.trim() || !password) {
    console.warn(
      "Skipping seed: set SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD in .env",
    );
    return;
  }

  const adapter = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter });

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
