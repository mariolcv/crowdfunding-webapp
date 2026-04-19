import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWithdrawalCompletedEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const withdrawals = await prisma.withdrawalRequest.findMany({
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(withdrawals);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status, notes } = await req.json();

  if (!["PROCESSING", "COMPLETED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const withdrawal = await prisma.withdrawalRequest.findUnique({
    where: { id },
    include: { user: { include: { wallet: true } } },
  });

  if (!withdrawal) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.withdrawalRequest.update({
      where: { id },
      data: { status, notes, processedAt: new Date() },
    });

    if (status === "COMPLETED" && withdrawal.user.wallet) {
      await tx.wallet.update({
        where: { userId: withdrawal.userId },
        data: {
          balance: { decrement: Number(withdrawal.amount) },
          totalWithdrawn: { increment: Number(withdrawal.amount) },
        },
      });
      await tx.transaction.create({
        data: {
          walletId: withdrawal.user.wallet.id,
          type: "WITHDRAWAL",
          amount: Number(withdrawal.amount),
          description: "Retirada bancaria",
        },
      });
    }

    if (status === "REJECTED" && withdrawal.user.wallet) {
      // No deduct balance since it was never deducted on request
    }
  });

  if (status === "COMPLETED") {
    sendWithdrawalCompletedEmail(
      withdrawal.user.email,
      withdrawal.user.name || "Inversor",
      Number(withdrawal.amount),
      withdrawal.iban
    ).catch(() => null);
  }

  return NextResponse.json({ ok: true });
}
