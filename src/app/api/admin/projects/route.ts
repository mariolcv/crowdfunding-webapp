import { NextRequest, NextResponse } from "next/server";
import { z, zodMessage } from "@/lib/zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const projectSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  location: z.string().optional(),
  mapEmbed: z.string().optional(),
  fundingGoal: z.number().positive(),
  annualRate: z.number().positive().max(100),
  durationMonths: z.number().int().positive(),
  minInvestment: z.number().default(100),
  status: z.enum(["DRAFT", "STUDY", "OPEN_FOR_INVESTMENT", "FUNDED", "IN_RENOVATION", "FOR_SALE", "SOLD", "COMPLETED"]).optional(),
  openDate: z.string().optional(),
  closeDate: z.string().optional(),
  estimatedEndDate: z.string().optional(),
  financialBreakdown: z.any().optional(),
  documents: z.any().optional(),
});

async function requireAdmin(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { investments: true } } },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const data = projectSchema.parse(body);

    const slug = slugify(data.name);
    const project = await prisma.project.create({
      data: {
        ...data,
        slug,
        openDate: data.openDate ? new Date(data.openDate) : undefined,
        closeDate: data.closeDate ? new Date(data.closeDate) : undefined,
        estimatedEndDate: data.estimatedEndDate ? new Date(data.estimatedEndDate) : undefined,
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: zodMessage(err) }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
