import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/taxes";
import { formatDate } from "@/lib/utils";
import { ProjectStatusBadge } from "@/components/ui/Badge";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AdminProjectStatusUpdate } from "@/components/admin/AdminProjectStatusUpdate";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { _count: { select: { investments: true, updates: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
        <Link href="/admin/proyectos/nuevo">
          <Button>+ Nuevo proyecto</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {projects.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-bold text-gray-900 text-lg">{p.name}</h2>
                  <ProjectStatusBadge status={p.status} />
                </div>
                <p className="text-sm text-gray-500">{p.location} · {formatCurrency(Number(p.fundingGoal))} objetivo · {Number(p.annualRate).toFixed(1)}% · {p.durationMonths}m</p>
                <p className="text-sm text-gray-400 mt-1">{p._count.investments} inversiones · {p._count.updates} actualizaciones</p>
              </div>
              <div className="flex gap-2 items-center shrink-0">
                <Link href={`/admin/proyectos/${p.id}`}>
                  <Button variant="outline" size="sm">Editar</Button>
                </Link>
                <AdminProjectStatusUpdate projectId={p.id} currentStatus={p.status} />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{formatCurrency(Number(p.currentFunding))} captados</span>
                <span>{Math.min(100, (Number(p.currentFunding) / Number(p.fundingGoal)) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${Math.min(100, (Number(p.currentFunding) / Number(p.fundingGoal)) * 100)}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
