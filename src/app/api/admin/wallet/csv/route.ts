import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";
import { sendDepositConfirmedEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") return null;
  return session;
}

interface CsvRow {
  referencia?: string;
  importe?: string;
  fecha?: string;
  concepto?: string;
  [key: string]: string | undefined;
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });

  const text = await file.text();
  const { data } = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true });

  const results: { ref: string; matched: boolean; amount?: number }[] = [];

  for (const row of data) {
    const ref = row.referencia?.trim().toUpperCase();
    const amount = parseFloat((row.importe || "0").replace(",", "."));

    if (!ref || isNaN(amount) || amount <= 0) continue;

    const user = await prisma.user.findUnique({
      where: { depositRef: ref },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      results.push({ ref, matched: false });
      continue;
    }

    // Check duplicate
    const existing = await prisma.transaction.findFirst({
      where: { walletId: user.wallet.id, reference: ref, type: "DEPOSIT" },
    });

    if (existing) {
      results.push({ ref, matched: true, amount: 0 });
      continue;
    }

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: user.id },
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
          reference: ref,
          description: `Depósito CSV - ${row.concepto || ""}`.trim(),
        },
      }),
    ]);

    sendDepositConfirmedEmail(user.email, user.name || "Inversor", amount, ref).catch(() => null);
    results.push({ ref, matched: true, amount });
  }

  return NextResponse.json({ results });
}
