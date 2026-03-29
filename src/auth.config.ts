import type { NextAuthConfig } from "next-auth";

export type AppUserRole = "SUPER_ADMIN" | "SHOP_ADMIN";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [], // Empty for Edge compatibility. Filled in auth.ts
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = (user as { role: AppUserRole }).role;
        token.mustChangePassword = (user as { mustChangePassword: boolean }).mustChangePassword;
      }
      if (trigger === "update" && session && typeof session === "object") {
        const s = session as { mustChangePassword?: boolean };
        if (typeof s.mustChangePassword === "boolean") {
          token.mustChangePassword = s.mustChangePassword;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as AppUserRole;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
