import { NextRequest, NextResponse } from "next/server";
import { z, zodMessage } from "@/lib/zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  amount: z.number().min(50),
  iban: z.string().min(15).max(34),
  holder: z.string().min(2),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id!;

  try {
    const body = await req.json();
    const { amount, iban, holder } = schema.parse(body);

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || Number(wallet.balance) < amount) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
    }

    // Check no pending withdrawal
    const pending = await prisma.withdrawalRequest.findFirst({
      where: { userId, status: "PENDING" },
    });
    if (pending) {
      return NextResponse.json({ error: "Ya tienes una solicitud pendiente" }, { status: 400 });
    }

    await prisma.withdrawalRequest.create({
      data: { userId, amount, iban, holder },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: zodMessage(err) }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
