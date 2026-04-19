import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/taxes";
import { formatDate } from "@/lib/utils";
import { KycStatusBadge, Badge } from "@/components/ui/Badge";
import { AdminUserActions } from "@/components/admin/AdminUserActions";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      dni: true,
      kycStatus: true,
      kycNotes: true,
      role: true,
      isBlocked: true,
      createdAt: true,
      depositRef: true,
      wallet: { select: { balance: true } },
      _count: { select: { investments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios ({users.length})</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Usuario</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">DNI</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">KYC</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">Saldo</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Inversiones</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Referencia</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Registro</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{user.firstName ? `${user.firstName} ${user.lastName}` : user.name || "—"}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                    {user.isBlocked && <Badge variant="danger" className="mt-1">Bloqueado</Badge>}
                    {user.role === "ADMIN" && <Badge variant="purple" className="mt-1">Admin</Badge>}
                  </td>
                  <td className="px-5 py-4 text-gray-700">{user.dni || "—"}</td>
                  <td className="px-5 py-4 text-center"><KycStatusBadge status={user.kycStatus} /></td>
                  <td className="px-5 py-4 text-right font-medium">{formatCurrency(Number(user.wallet?.balance || 0))}</td>
                  <td className="px-5 py-4 text-center">{user._count.investments}</td>
                  <td className="px-5 py-4 text-gray-500 font-mono text-xs">{user.depositRef || "—"}</td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-4 text-center">
                    <AdminUserActions
                      userId={user.id}
                      kycStatus={user.kycStatus}
                      isBlocked={user.isBlocked}
                      role={user.role}
                    />
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
