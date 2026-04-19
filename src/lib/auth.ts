import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateDepositRef } from "@/lib/utils";

function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;
        if (user.isBlocked || user.deletedAt) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          kycStatus: user.kycStatus,
          isBlocked: user.isBlocked,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.kycStatus = (user as { kycStatus: string }).kycStatus;
        token.isBlocked = (user as { isBlocked: boolean }).isBlocked ?? false;
      }
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, kycStatus: true, isBlocked: true, deletedAt: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.kycStatus = dbUser.kycStatus;
          token.isBlocked = dbUser.isBlocked;
          token.isDeleted = !!dbUser.deletedAt;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as unknown as Record<string, unknown>).role = token.role;
        (session.user as unknown as Record<string, unknown>).kycStatus = token.kycStatus;
        (session.user as unknown as Record<string, unknown>).isBlocked = token.isBlocked;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      const ref = generateDepositRef();
      await prisma.$transaction([
        prisma.wallet.create({ data: { userId: user.id! } }),
        prisma.user.update({ where: { id: user.id! }, data: { depositRef: ref } }),
      ]);
    },
  },
});
