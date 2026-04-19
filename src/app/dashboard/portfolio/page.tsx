import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/taxes";
import { InvestmentStatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { FileText } from "lucide-react";

export default async function PortfolioPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const investments = await prisma.investment.findMany({
    where: { userId },
    include: { project: { select: { name: true, slug: true, estimatedEndDate: true } } },
    orderBy: { createdAt: "desc" },
  });

  const active = investments.filter((i) => i.status === "ACTIVE");
  const completed = investments.filter((i) => i.status === "COMPLETED");
  const pending = investments.filter((i) => i.status === "PENDING");

  const totalActive = active.reduce((s, i) => s + Number(i.amount), 0);
  const totalReturned = completed.reduce((s, i) => s + Number(i.amount) + Number(i.netInterest || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mi Portfolio</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-center">
          <p className="text-2xl font-bold text-blue-800">{formatCurrency(totalActive)}</p>
          <p className="text-sm text-gray-500 mt-1">Capital activo</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totalReturned)}</p>
          <p className="text-sm text-gray-500 mt-1">Total retornado</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{investments.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total inversiones</p>
        </div>
      </div>

      {pending.length > 0 && (
        <Section title="Pendientes de aprobación" investments={pending} />
      )}

      {active.length > 0 && (
        <Section title="Inversiones activas" investments={active} />
      )}

      {completed.length > 0 && (
        <Section title="Inversiones completadas" investments={completed} showReturns />
      )}

      {investments.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium mb-2">Aún no tienes inversiones</p>
          <p className="text-sm mb-6">Explora los proyectos disponibles y empieza a invertir.</p>
          <Link href="/proyectos" className="inline-flex items-center gap-2 bg-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors">
            Ver proyectos
          </Link>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  investments,
  showReturns = false,
}: {
  title: string;
  investments: Array<{
    id: string;
    amount: unknown;
    annualRate: unknown;
    durationMonths: number;
    status: string;
    contractUrl: string | null;
    createdAt: Date;
    grossInterest: unknown;
    withholding: unknown;
    netInterest: unknown;
    project: { name: string; slug: string; estimatedEndDate: Date | null };
  }>;
  showReturns?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Proyecto</th>
              <th className="text-right px-5 py-3 text-gray-500 font-medium">Importe</th>
              <th className="text-right px-5 py-3 text-gray-500 font-medium">Interés</th>
              {showReturns && <th className="text-right px-5 py-3 text-gray-500 font-medium">Retorno neto</th>}
              {showReturns && <th className="text-right px-5 py-3 text-gray-500 font-medium">Retención</th>}
              <th className="text-center px-5 py-3 text-gray-500 font-medium">Estado</th>
              <th className="text-center px-5 py-3 text-gray-500 font-medium">Contrato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {investments.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <Link href={`/proyectos/${inv.project.slug}`} className="font-medium text-gray-900 hover:text-blue-800">
                    {inv.project.name}
                  </Link>
                  {inv.project.estimatedEndDate && (
                    <p className="text-xs text-gray-400">Est. {formatDate(inv.project.estimatedEndDate)}</p>
                  )}
                </td>
                <td className="px-5 py-4 text-right font-medium">{formatCurrency(Number(inv.amount))}</td>
                <td className="px-5 py-4 text-right text-green-700">{Number(inv.annualRate).toFixed(1)}% · {inv.durationMonths}m</td>
                {showReturns && <td className="px-5 py-4 text-right font-medium text-green-700">{formatCurrency(Number(inv.netInterest || 0))}</td>}
                {showReturns && <td className="px-5 py-4 text-right text-red-600">{formatCurrency(Number(inv.withholding || 0))}</td>}
                <td className="px-5 py-4 text-center"><InvestmentStatusBadge status={inv.status} /></td>
                <td className="px-5 py-4 text-center">
                  {inv.contractUrl ? (
                    <a href={inv.contractUrl} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline inline-flex items-center gap-1">
                      <FileText className="h-4 w-4" /> PDF
                    </a>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
