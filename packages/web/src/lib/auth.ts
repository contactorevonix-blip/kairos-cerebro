import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),

  providers: [
    /* Magic link via Resend email */
    Resend({
      from:    process.env.EMAIL_FROM ?? "noreply@kairos.app",
      apiKey:  process.env.RESEND_API_KEY ?? "",
    }),

    /* Email + password (optional — for dev/testing) */
    Credentials({
      name: "Email & Password",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z.object({
          email:    z.string().email(),
          password: z.string().min(8),
        }).safeParse(credentials);

        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user) return null;
        return user;
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn:  "/login",
    signOut: "/",
    error:   "/login",
    verifyRequest: "/login/verify",
  },

  events: {
    async createUser({ user }) {
      /* Grant free welcome tokens to new users */
      if (user.id) {
        await db.tokenBalance.create({
          data: {
            userId:   user.id,
            balance:  10,
            lifetime: 10,
          },
        });
        await db.transaction.create({
          data: {
            userId:      user.id,
            type:        "BONUS",
            amount:      10,
            description: "Welcome bonus — 10 free tokens",
          },
        });
      }
    },
  },
});
