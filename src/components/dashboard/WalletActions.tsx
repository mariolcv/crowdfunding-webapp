"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";

interface WalletActionsProps {
  balance: number;
  pendingWithdrawal: boolean;
  userIban?: string | null;
}

export function WalletActions({ balance, pendingWithdrawal, userIban }: WalletActionsProps) {
  const router = useRouter();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ amount: "", iban: userIban || "", holder: "" });

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(form.amount), iban: form.iban, holder: form.holder }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al solicitar retirada");
      setLoading(false);
      return;
    }

    router.refresh();
    setShowWithdraw(false);
  };

  if (pendingWithdrawal) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        Tienes una solicitud de retirada en proceso. Recibirás un email cuando sea procesada.
      </div>
    );
  }

  return (
    <div>
      <Button variant="outline" onClick={() => setShowWithdraw(!showWithdraw)}>
        Solicitar retirada
      </Button>

      {showWithdraw && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Solicitar retirada de fondos</h3>
          <form onSubmit={handleWithdraw} className="space-y-4 max-w-md">
            {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
            <Input
              label="Importe (€)"
              type="number"
              min={50}
              max={balance}
              step={1}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              hint={`Disponible: €${balance.toFixed(2)}`}
              required
            />
            <Input
              label="IBAN de destino"
              type="text"
              placeholder="ES00 0000 0000 0000 0000 0000"
              value={form.iban}
              onChange={(e) => setForm({ ...form, iban: e.target.value })}
              required
            />
            <Input
              label="Titular de la cuenta"
              type="text"
              value={form.holder}
              onChange={(e) => setForm({ ...form, holder: e.target.value })}
              required
            />
            <div className="flex gap-3">
              <Button type="submit" loading={loading}>Solicitar retirada</Button>
              <Button type="button" variant="ghost" onClick={() => setShowWithdraw(false)}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
