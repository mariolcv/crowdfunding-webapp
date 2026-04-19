import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const kycStatus = searchParams.get("kycStatus");

  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      ...(kycStatus ? { kycStatus: kycStatus as "PENDING" | "APPROVED" | "REJECTED" } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      firstName: true,
      lastName: true,
      dni: true,
      kycStatus: true,
      role: true,
      isBlocked: true,
      createdAt: true,
      depositRef: true,
      wallet: { select: { balance: true } },
      _count: { select: { investments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, kycStatus, kycNotes, isBlocked, role } = await req.json();

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(kycStatus !== undefined ? { kycStatus } : {}),
      ...(kycNotes !== undefined ? { kycNotes } : {}),
      ...(isBlocked !== undefined ? { isBlocked } : {}),
      ...(role !== undefined ? { role } : {}),
    },
  });

  return NextResponse.json(user);
}
