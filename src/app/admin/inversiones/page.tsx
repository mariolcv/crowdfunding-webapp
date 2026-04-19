import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/taxes";
import { formatDate } from "@/lib/utils";
import { InvestmentStatusBadge } from "@/components/ui/Badge";
import { AdminInvestmentActions } from "@/components/admin/AdminInvestmentActions";
import { FileText } from "lucide-react";

export default async function AdminInvestmentsPage() {
  const investments = await prisma.investment.findMany({
    include: {
      user: { select: { name: true, firstName: true, lastName: true, email: true } },
      project: { select: { name: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inversiones ({investments.length})</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Inversor</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Proyecto</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">Importe</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Interés</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Estado</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Fecha</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Contrato</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {investments.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">
                      {inv.user.firstName ? `${inv.user.firstName} ${inv.user.lastName}` : inv.user.name || "—"}
                    </p>
                    <p className="text-xs text-gray-400">{inv.user.email}</p>
                  </td>
                  <td className="px-5 py-4 font-medium">{inv.project.name}</td>
                  <td className="px-5 py-4 text-right font-bold">{formatCurrency(Number(inv.amount))}</td>
                  <td className="px-5 py-4 text-center text-green-700">{Number(inv.annualRate).toFixed(1)}% · {inv.durationMonths}m</td>
                  <td className="px-5 py-4 text-center"><InvestmentStatusBadge status={inv.status} /></td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(inv.createdAt)}</td>
                  <td className="px-5 py-4 text-center">
                    {inv.contractUrl ? (
                      <a href={inv.contractUrl} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline inline-flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                      </a>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <AdminInvestmentActions investmentId={inv.id} status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
