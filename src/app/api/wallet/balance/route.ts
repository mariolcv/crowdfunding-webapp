import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id! },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!wallet) {
    return NextResponse.json({ error: "Wallet no encontrada" }, { status: 404 });
  }

  return NextResponse.json(wallet);
}
