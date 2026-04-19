import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      updates: {
        orderBy: { publishedAt: "desc" },
        take: 10,
      },
      _count: { select: { investments: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!project || project.status === "DRAFT") {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(project);
}
