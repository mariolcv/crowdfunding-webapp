import type { DefaultSession } from "next-auth";
import type { UserRole, KycStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      kycStatus: KycStatus;
      isBlocked: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    kycStatus: KycStatus;
    isBlocked: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    kycStatus: string;
    isBlocked: boolean;
    isDeleted: boolean;
  }
}
