import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInvestmentApprovedEmail } from "@/lib/email";
import { sendPushToUser } from "@/lib/push";

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const investments = await prisma.investment.findMany({
    where: status ? { status: status as "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" } : undefined,
    include: {
      user: { select: { name: true, email: true, dni: true } },
      project: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(investments);
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status } = await req.json();

  if (!["ACTIVE", "CANCELLED"].includes(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const investment = await prisma.investment.findUnique({
    where: { id },
    include: {
      user: true,
      project: true,
    },
  });

  if (!investment) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.investment.update({
      where: { id },
      data: {
        status,
        approvedAt: status === "ACTIVE" ? new Date() : undefined,
      },
    });

    if (status === "ACTIVE") {
      await tx.project.update({
        where: { id: investment.projectId },
        data: { currentFunding: { increment: Number(investment.amount) } },
      });
    }

    if (status === "CANCELLED") {
      // Refund to wallet
      const wallet = await tx.wallet.findUnique({ where: { userId: investment.userId } });
      if (wallet) {
        await tx.wallet.update({
          where: { userId: investment.userId },
          data: {
            balance: { increment: Number(investment.amount) },
            totalInvested: { decrement: Number(investment.amount) },
          },
        });
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: "RETURN",
            amount: Number(investment.amount),
            description: `Inversión cancelada - ${investment.project.name}`,
            investmentId: investment.id,
          },
        });
      }
    }
  });

  if (status === "ACTIVE") {
    sendInvestmentApprovedEmail(
      investment.user.email,
      investment.user.name || "Inversor",
      investment.project.name,
      Number(investment.amount),
      investment.contractUrl || ""
    ).catch(() => null);

    sendPushToUser(investment.userId, {
      title: "Inversión aprobada",
      body: `Tu inversión en ${investment.project.name} ha sido aprobada`,
      url: "/dashboard/portfolio",
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true });
}
