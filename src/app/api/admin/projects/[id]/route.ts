import { NextRequest, NextResponse } from "next/server";
import { z, zodMessage } from "@/lib/zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateInterest } from "@/lib/taxes";
import {
  sendProjectCompletedEmail,
  sendProjectUpdateEmail,
} from "@/lib/email";
import { sendPushToUser } from "@/lib/push";

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") return null;
  return session;
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  mapEmbed: z.string().optional(),
  fundingGoal: z.number().positive().optional(),
  annualRate: z.number().positive().optional(),
  durationMonths: z.number().int().positive().optional(),
  status: z.enum(["DRAFT", "STUDY", "OPEN_FOR_INVESTMENT", "FUNDED", "IN_RENOVATION", "FOR_SALE", "SOLD", "COMPLETED"]).optional(),
  openDate: z.string().nullable().optional(),
  closeDate: z.string().nullable().optional(),
  estimatedEndDate: z.string().nullable().optional(),
  financialBreakdown: z.any().optional(),
  documents: z.any().optional(),
  realAnnualRate: z.number().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  try {
    const data = updateSchema.parse(body);
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        openDate: data.openDate ? new Date(data.openDate) : undefined,
        closeDate: data.closeDate ? new Date(data.closeDate) : undefined,
        estimatedEndDate: data.estimatedEndDate ? new Date(data.estimatedEndDate) : undefined,
      },
    });

    // If completing project, distribute returns
    if (data.status === "COMPLETED") {
      await distributeReturns(id, data.realAnnualRate);
    }

    return NextResponse.json(project);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: zodMessage(err) }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

async function distributeReturns(projectId: string, realAnnualRate?: number) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  const rate = realAnnualRate ?? Number(project.annualRate);

  const investments = await prisma.investment.findMany({
    where: { projectId, status: "ACTIVE" },
    include: { user: { include: { wallet: true } } },
  });

  for (const inv of investments) {
    if (!inv.user.wallet) continue;

    const { gross, withholding, net } = calculateInterest(
      Number(inv.amount),
      rate,
      inv.durationMonths
    );

    await prisma.$transaction([
      prisma.investment.update({
        where: { id: inv.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          grossInterest: gross,
          withholding,
          netInterest: net,
        },
      }),
      prisma.wallet.update({
        where: { userId: inv.userId },
        data: {
          balance: { increment: Number(inv.amount) + net },
          totalReturned: { increment: Number(inv.amount) + net },
        },
      }),
      prisma.transaction.create({
        data: {
          walletId: inv.user.wallet.id,
          type: "CAPITAL_RETURN",
          amount: Number(inv.amount),
          description: `Retorno capital - ${project.name}`,
          investmentId: inv.id,
        },
      }),
      prisma.transaction.create({
        data: {
          walletId: inv.user.wallet.id,
          type: "INTEREST",
          amount: net,
          description: `Interés neto - ${project.name}`,
          investmentId: inv.id,
        },
      }),
    ]);

    sendProjectCompletedEmail(
      inv.user.email,
      inv.user.name || "Inversor",
      project.name,
      Number(inv.amount),
      gross,
      withholding,
      net
    ).catch(() => null);

    sendPushToUser(inv.userId, {
      title: "Proyecto completado",
      body: `Tu retorno de €${(Number(inv.amount) + net).toFixed(2)} está disponible`,
      url: "/dashboard/portfolio",
    }).catch(() => null);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
