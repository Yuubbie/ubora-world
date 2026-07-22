import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  // TEMPORARY: prints detailed auth failure reasons to the server logs.
  // Remove this once we've found the preview-login issue.
  debug: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          console.log("[auth] missing identifier or password in submitted form");
          return null;
        }

        const user = await db.user.findFirst({
          where: {
            OR: [{ email: credentials.identifier }, { phone: credentials.identifier }],
          },
        });
        if (!user) {
          console.log("[auth] no user found matching identifier:", credentials.identifier);
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          console.log("[auth] password did not match for user:", credentials.identifier);
          return null;
        }

        console.log("[auth] login succeeded for user:", credentials.identifier);
        return {
          id: user.id,
          name: user.fullName,
          email: user.email ?? undefined,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
