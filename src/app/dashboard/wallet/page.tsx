import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/taxes";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { WalletActions } from "@/components/dashboard/WalletActions";
import { ArrowDownLeft, ArrowUpRight, TrendingUp, RefreshCw } from "lucide-react";

const txTypeLabel: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DEPOSIT: { label: "Depósito", color: "text-green-700", icon: <ArrowDownLeft className="h-4 w-4" /> },
  WITHDRAWAL: { label: "Retirada", color: "text-red-600", icon: <ArrowUpRight className="h-4 w-4" /> },
  INVESTMENT: { label: "Inversión", color: "text-blue-700", icon: <TrendingUp className="h-4 w-4" /> },
  RETURN: { label: "Devolución", color: "text-green-700", icon: <ArrowDownLeft className="h-4 w-4" /> },
  INTEREST: { label: "Interés", color: "text-green-700", icon: <ArrowDownLeft className="h-4 w-4" /> },
  CAPITAL_RETURN: { label: "Retorno capital", color: "text-green-700", icon: <RefreshCw className="h-4 w-4" /> },
};

export default async function WalletPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { depositRef: true, bankIban: true },
  });

  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  const pendingWithdrawal = await prisma.withdrawalRequest.findFirst({
    where: { userId, status: { in: ["PENDING", "PROCESSING"] } },
  });

  if (!wallet) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mi Wallet</h1>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Saldo disponible", value: Number(wallet.balance), highlight: true },
          { label: "Total depositado", value: Number(wallet.totalDeposited) },
          { label: "Total invertido", value: Number(wallet.totalInvested) },
          { label: "Total retornado", value: Number(wallet.totalReturned) },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`rounded-xl p-5 border shadow-sm ${highlight ? "bg-blue-800 text-white border-blue-700" : "bg-white border-gray-200"}`}>
            <p className={`text-sm ${highlight ? "text-blue-200" : "text-gray-500"}`}>{label}</p>
            <p className={`text-2xl font-bold mt-1 ${highlight ? "text-white" : "text-gray-900"}`}>{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      {/* Deposit info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-semibold text-blue-900 mb-3">Cómo depositar fondos</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>Realiza una transferencia bancaria a:</p>
          <div className="bg-white rounded-lg p-3 space-y-1 font-mono text-gray-900">
            <p><span className="text-gray-500">Empresa:</span> {process.env.NEXT_PUBLIC_COMPANY_NAME}</p>
            <p><span className="text-gray-500">IBAN:</span> {process.env.NEXT_PUBLIC_COMPANY_IBAN}</p>
            <p><span className="text-gray-500 font-sans">Referencia obligatoria:</span> <span className="font-bold text-blue-800">{user?.depositRef}</span></p>
          </div>
          <p className="text-xs text-blue-600">Incluye siempre tu referencia en el concepto para que podamos identificar tu transferencia.</p>
        </div>
      </div>

      {/* Actions */}
      <WalletActions balance={Number(wallet.balance)} pendingWithdrawal={!!pendingWithdrawal} userIban={user?.bankIban} />

      {/* Transaction history */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Historial de movimientos</h2>
        </div>
        {wallet.transactions.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">Aún no hay movimientos</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {wallet.transactions.map((tx) => {
              const config = txTypeLabel[tx.type] || { label: tx.type, color: "text-gray-700", icon: null };
              const isCredit = ["DEPOSIT", "RETURN", "INTEREST", "CAPITAL_RETURN"].includes(tx.type);
              return (
                <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCredit ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {config.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{config.label}</p>
                      {tx.description && <p className="text-xs text-gray-400">{tx.description}</p>}
                      <p className="text-xs text-gray-400">{formatDateTime(tx.createdAt)}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${isCredit ? "text-green-700" : "text-red-600"}`}>
                    {isCredit ? "+" : "-"}{formatCurrency(Number(tx.amount))}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
