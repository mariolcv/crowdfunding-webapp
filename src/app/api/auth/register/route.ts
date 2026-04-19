import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z, zodMessage } from "@/lib/zod";
import { prisma } from "@/lib/prisma";
import { generateDepositRef } from "@/lib/utils";
import { sendWelcomeEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email ya registrado" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 12);
    const depositRef = generateDepositRef();

    await prisma.$transaction([
      prisma.user.create({
        data: { name, email, password: hash, depositRef },
      }),
    ]);

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.wallet.create({ data: { userId: user.id } });
      sendWelcomeEmail(email, name).catch(() => null);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: zodMessage(err) }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
