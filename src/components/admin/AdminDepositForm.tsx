"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  depositRef: string | null;
}

export function AdminDepositForm({ users }: { users: User[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ userId: "", amount: "", reference: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: form.userId, amount: Number(form.amount), reference: form.reference, description: form.description }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error");
    } else {
      setSuccess(true);
      setForm({ userId: "", amount: "", reference: "", description: "" });
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">Depósito añadido correctamente.</div>}

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Usuario</label>
        <select
          value={form.userId}
          onChange={(e) => setForm({ ...form, userId: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Seleccionar usuario...</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.firstName ? `${u.firstName} ${u.lastName}` : u.name || u.email} ({u.depositRef})
            </option>
          ))}
        </select>
      </div>

      <Input label="Importe (€)" type="number" min={1} step={0.01} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
      <Input label="Referencia" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="INV-12345" />
      <Input label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

      <Button type="submit" loading={loading} className="w-full">Añadir depósito</Button>
    </form>
  );
}
