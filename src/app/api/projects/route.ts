import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      location: true,
      images: true,
      fundingGoal: true,
      currentFunding: true,
      annualRate: true,
      durationMonths: true,
      status: true,
      openDate: true,
      closeDate: true,
      estimatedEndDate: true,
    },
  });
  return NextResponse.json(projects);
}
