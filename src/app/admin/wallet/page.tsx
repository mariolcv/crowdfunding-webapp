import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/taxes";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { AdminDepositForm } from "@/components/admin/AdminDepositForm";
import { AdminCsvUpload } from "@/components/admin/AdminCsvUpload";
import { AdminWithdrawalActions } from "@/components/admin/AdminWithdrawalActions";

export default async function AdminWalletPage() {
  const withdrawals = await prisma.withdrawalRequest.findMany({
    include: { user: { select: { name: true, firstName: true, lastName: true, email: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, firstName: true, lastName: true, email: true, depositRef: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Gestión de Wallet</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Depósito manual</h2>
          <AdminDepositForm users={users} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Conciliación CSV bancario</h2>
          <p className="text-sm text-gray-500 mb-4">
            El CSV debe tener columnas: <code className="bg-gray-100 px-1 rounded">referencia, importe, fecha, concepto</code>
          </p>
          <AdminCsvUpload />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Solicitudes de retirada</h2>
          <a href="/api/admin/retenciones" download className="text-sm text-purple-700 hover:underline">
            Descargar CSV retenciones
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Usuario</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">Importe</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">IBAN</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Estado</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Fecha</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {withdrawals.map((w) => {
                const variantMap: Record<string, "warning" | "success" | "info" | "danger"> = {
                  PENDING: "warning", PROCESSING: "info", COMPLETED: "success", REJECTED: "danger",
                };
                return (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium">{w.user.firstName ? `${w.user.firstName} ${w.user.lastName}` : w.user.name}</p>
                      <p className="text-xs text-gray-400">{w.user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-right font-bold">{formatCurrency(Number(w.amount))}</td>
                    <td className="px-5 py-4 text-gray-500 font-mono text-xs">{w.iban}</td>
                    <td className="px-5 py-4 text-center">
                      <Badge variant={variantMap[w.status] || "default"}>
                        {w.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(w.createdAt)}</td>
                    <td className="px-5 py-4 text-center">
                      <AdminWithdrawalActions withdrawalId={w.id} status={w.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
