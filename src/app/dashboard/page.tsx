import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/taxes";
import { KycStatusBadge } from "@/components/ui/Badge";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { TrendingUp, Wallet, AlertCircle, CheckCircle } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
      investments: {
        where: { status: "ACTIVE" },
        include: { project: { select: { name: true, slug: true } } },
        take: 3,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) return null;

  const totalInvested = user.investments.reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {user.firstName || user.name || "Inversor"}</h1>
        <p className="text-gray-500 text-sm mt-1">Panel de control de tu inversión</p>
      </div>

      {/* KYC alert */}
      {user.kycStatus !== "APPROVED" && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${user.kycStatus === "REJECTED" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
          <AlertCircle className={`h-5 w-5 mt-0.5 shrink-0 ${user.kycStatus === "REJECTED" ? "text-red-500" : "text-yellow-500"}`} />
          <div className="flex-1">
            <p className="font-medium text-gray-900 text-sm">
              {user.kycStatus === "PENDING" ? "Completa tu verificación KYC" : "KYC rechazado"}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              {user.kycStatus === "PENDING"
                ? "Debes completar tu perfil y verificación de identidad para poder invertir."
                : `Motivo: ${user.kycNotes || "Contacta con soporte"}`}
            </p>
            {user.kycStatus === "PENDING" && (
              <Link href="/dashboard/profile" className="mt-2 inline-block">
                <Button size="sm">Completar perfil</Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {user.kycStatus === "APPROVED" && (
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
          <p className="text-sm text-green-800 font-medium">Identidad verificada. Puedes invertir.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wallet className="h-4 w-4 text-blue-800" />
            </div>
            <p className="text-sm text-gray-500">Saldo disponible</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(Number(user.wallet?.balance || 0))}</p>
          <Link href="/dashboard/wallet" className="text-xs text-blue-800 hover:underline mt-1 block">Ver wallet →</Link>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-700" />
            </div>
            <p className="text-sm text-gray-500">Total invertido</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInvested)}</p>
          <Link href="/dashboard/portfolio" className="text-xs text-blue-800 hover:underline mt-1 block">Ver portfolio →</Link>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-700" />
            </div>
            <p className="text-sm text-gray-500">Inversiones activas</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{user.investments.length}</p>
        </div>
      </div>

      {/* Recent investments */}
      {user.investments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Inversiones recientes</h2>
            <Link href="/dashboard/portfolio" className="text-xs text-blue-800 hover:underline">Ver todas</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {user.investments.map((inv) => (
              <div key={inv.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <Link href={`/proyectos/${inv.project.slug}`} className="font-medium text-gray-900 hover:text-blue-800 text-sm">
                    {inv.project.name}
                  </Link>
                  <p className="text-xs text-gray-500">{Number(inv.annualRate).toFixed(1)}% anual · {inv.durationMonths} meses</p>
                </div>
                <p className="font-bold text-gray-900">{formatCurrency(Number(inv.amount))}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
