"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    mapEmbed: "",
    fundingGoal: "",
    annualRate: "",
    durationMonths: "",
    minInvestment: "100",
    openDate: "",
    closeDate: "",
    estimatedEndDate: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        fundingGoal: Number(form.fundingGoal),
        annualRate: Number(form.annualRate),
        durationMonths: Number(form.durationMonths),
        minInvestment: Number(form.minInvestment),
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al crear proyecto");
      setLoading(false);
      return;
    }

    router.push(`/admin/proyectos/${data.id}`);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Nuevo proyecto</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Información general</h2>
          <Input label="Nombre del proyecto" value={form.name} onChange={set("name")} required />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Descripción *</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              required
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Input label="Ubicación" value={form.location} onChange={set("location")} />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Embed Google Maps (iframe)</label>
            <textarea value={form.mapEmbed} onChange={set("mapEmbed")} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Condiciones financieras</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Objetivo de financiación (€)" type="number" min={1000} value={form.fundingGoal} onChange={set("fundingGoal")} required />
            <Input label="Interés anual (%)" type="number" min={1} max={99} step={0.1} value={form.annualRate} onChange={set("annualRate")} required />
            <Input label="Duración (meses)" type="number" min={1} value={form.durationMonths} onChange={set("durationMonths")} required />
            <Input label="Inversión mínima (€)" type="number" min={100} step={100} value={form.minInvestment} onChange={set("minInvestment")} required />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Fechas</h2>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Fecha apertura" type="date" value={form.openDate} onChange={set("openDate")} />
            <Input label="Fecha cierre" type="date" value={form.closeDate} onChange={set("closeDate")} />
            <Input label="Fecha estimada fin" type="date" value={form.estimatedEndDate} onChange={set("estimatedEndDate")} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>Crear proyecto</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
