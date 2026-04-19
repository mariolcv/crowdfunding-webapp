import { NextRequest, NextResponse } from "next/server";
import { z, zodMessage } from "@/lib/zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToS3 } from "@/lib/s3";
import { generateContractPdf } from "@/lib/contract";

const schema = z.object({
  projectId: z.string().cuid(),
  amount: z.number().min(100).multipleOf(100),
  signatureData: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id!;

  try {
    const body = await req.json();
    const { projectId, amount, signatureData } = schema.parse(body);

    // Check KYC
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    if (user.kycStatus !== "APPROVED") {
      return NextResponse.json({ error: "KYC no aprobado" }, { status: 403 });
    }
    if (!user.wallet || Number(user.wallet.balance) < amount) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
    }

    // Check project
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.status !== "OPEN_FOR_INVESTMENT") {
      return NextResponse.json({ error: "Proyecto no disponible" }, { status: 400 });
    }

    const remaining = Number(project.fundingGoal) - Number(project.currentFunding);
    if (amount > remaining) {
      return NextResponse.json({ error: `Máximo disponible: €${remaining}` }, { status: 400 });
    }

    // Generate contract PDF
    const pdfBuffer = await generateContractPdf({
      user,
      project,
      amount,
      signatureData,
    });

    const contractKey = `contracts/${userId}/${projectId}-${Date.now()}.pdf`;
    const contractUrl = await uploadToS3(contractKey, pdfBuffer, "application/pdf");

    // Create investment and deduct wallet in transaction
    const investment = await prisma.$transaction(async (tx) => {
      const inv = await tx.investment.create({
        data: {
          userId,
          projectId,
          amount,
          annualRate: project.annualRate,
          durationMonths: project.durationMonths,
          contractUrl,
          signatureData,
          status: "PENDING",
        },
      });

      await tx.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
          totalInvested: { increment: amount },
        },
      });

      await tx.transaction.create({
        data: {
          walletId: user.wallet!.id,
          type: "INVESTMENT",
          amount,
          description: `Inversión en ${project.name}`,
          investmentId: inv.id,
        },
      });

      return inv;
    });

    return NextResponse.json({ id: investment.id, contractUrl });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: zodMessage(err) }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const investments = await prisma.investment.findMany({
    where: { userId: session.user.id! },
    include: { project: { select: { name: true, slug: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(investments);
}
