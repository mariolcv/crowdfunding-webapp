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
  const projectId = searchParams.get("projectId");

  const investments = await prisma.investment.findMany({
    where: {
      status: "COMPLETED",
      grossInterest: { not: null },
      ...(projectId ? { projectId } : {}),
    },
    include: {
      user: { select: { firstName: true, lastName: true, dni: true } },
      project: { select: { name: true } },
    },
  });

  const rows = [
    "NIF,Nombre,Apellidos,Importe Bruto,Retención,Neto,Proyecto,Periodo",
    ...investments.map((inv) =>
      [
        inv.user.dni || "",
        inv.user.firstName || "",
        inv.user.lastName || "",
        Number(inv.grossInterest).toFixed(2),
        Number(inv.withholding).toFixed(2),
        Number(inv.netInterest).toFixed(2),
        inv.project.name,
        new Date(inv.completedAt || Date.now()).getFullYear(),
      ].join(",")
    ),
  ].join("\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="retenciones-${new Date().getFullYear()}.csv"`,
    },
  });
}
