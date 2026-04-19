import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/taxes";
import Link from "next/link";

export default async function AdminDashboard() {
  const [
    totalUsers,
    pendingKyc,
    pendingInvestments,
    pendingWithdrawals,
    projects,
    walletsSum,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null, role: "INVESTOR" } }),
    prisma.user.count({ where: { kycStatus: "PENDING" } }),
    prisma.investment.count({ where: { status: "PENDING" } }),
    prisma.withdrawalRequest.count({ where: { status: "PENDING" } }),
    prisma.project.findMany({ select: { name: true, status: true, currentFunding: true, fundingGoal: true }, take: 5 }),
    prisma.wallet.aggregate({ _sum: { balance: true } }),
  ]);

  const stats = [
    { label: "Inversores registrados", value: totalUsers, href: "/admin/usuarios" },
    { label: "KYC pendientes", value: pendingKyc, href: "/admin/usuarios?kyc=PENDING", alert: pendingKyc > 0 },
    { label: "Inversiones pendientes", value: pendingInvestments, href: "/admin/inversiones?status=PENDING", alert: pendingInvestments > 0 },
    { label: "Retiros pendientes", value: pendingWithdrawals, href: "/admin/wallet?tab=withdrawals", alert: pendingWithdrawals > 0 },
    { label: "Total en wallets", value: formatCurrency(Number(walletsSum._sum.balance || 0)), href: "/admin/wallet" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}
            className={`bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow ${stat.alert ? "border-orange-300 bg-orange-50" : "border-gray-200"}`}>
            <p className={`text-sm ${stat.alert ? "text-orange-700" : "text-gray-500"}`}>{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.alert ? "text-orange-800" : "text-gray-900"}`}>{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Proyectos</h2>
        <div className="space-y-3">
          {projects.map((p) => {
            const pct = Math.min(100, (Number(p.currentFunding) / Number(p.fundingGoal)) * 100);
            return (
              <div key={p.name} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-gray-500">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full"><div className="h-full bg-purple-600 rounded-full" style={{ width: `${pct}%` }} /></div>
                </div>
                <span className="text-xs text-gray-400 w-20 text-right">{p.status}</span>
              </div>
            );
          })}
        </div>
        <Link href="/admin/proyectos" className="text-sm text-purple-700 hover:underline mt-4 block">Ver todos los proyectos →</Link>
      </div>
    </div>
  );
}
