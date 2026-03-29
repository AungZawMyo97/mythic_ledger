import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { authConfig, AppUserRole } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const { prisma } = await import("@/lib/prisma");
        const email = String(credentials.email).toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const valid = await compare(String(credentials.password), user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          role: user.role as AppUserRole,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
});
