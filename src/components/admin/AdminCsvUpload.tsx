"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function AdminCsvUpload() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{ ref: string; matched: boolean; amount?: number }> | null>(null);
  const [error, setError] = useState("");

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    if (!file) return;

    setLoading(true);
    setError("");
    setResults(null);

    const data = new FormData();
    data.append("file", file);

    const res = await fetch("/api/admin/wallet/csv", { method: "POST", body: data });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Error al procesar CSV");
    } else {
      setResults(json.results);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleUpload} className="space-y-3">
        <input type="file" name="file" accept=".csv" required className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
        <Button type="submit" loading={loading} className="w-full">Procesar CSV</Button>
      </form>

      {results && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1 max-h-48 overflow-y-auto">
          <p className="font-medium text-gray-900 mb-2">Resultados: {results.filter((r) => r.matched && r.amount && r.amount > 0).length} procesados</p>
          {results.map((r, i) => (
            <div key={i} className={`flex justify-between ${r.matched ? "text-green-700" : "text-red-600"}`}>
              <span>{r.ref}</span>
              <span>{r.matched ? (r.amount ? `€${r.amount?.toFixed(2)}` : "Duplicado") : "No encontrado"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
