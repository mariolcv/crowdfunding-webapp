import { NextRequest, NextResponse } from "next/server";
import { z, zodMessage } from "@/lib/zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendDepositConfirmedEmail } from "@/lib/email";
import { sendPushToUser } from "@/lib/push";

const schema = z.object({
  userId: z.string().cuid(),
  amount: z.number().positive(),
  reference: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, amount, reference, description } = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });
    if (!user || !user.wallet) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: {
          balance: { increment: amount },
          totalDeposited: { increment: amount },
        },
      }),
      prisma.transaction.create({
        data: {
          walletId: user.wallet.id,
          type: "DEPOSIT",
          amount,
          reference,
          description: description || "Depósito bancario",
        },
      }),
    ]);

    sendDepositConfirmedEmail(user.email, user.name || "Inversor", amount, reference || "").catch(() => null);
    sendPushToUser(userId, {
      title: "Depósito confirmado",
      body: `€${amount.toFixed(2)} acreditados en tu wallet`,
      url: "/dashboard/wallet",
    }).catch(() => null);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: zodMessage(err) }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
