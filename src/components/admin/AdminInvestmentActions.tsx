"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function AdminInvestmentActions({ investmentId, status }: { investmentId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const update = async (newStatus: string) => {
    setLoading(true);
    await fetch("/api/admin/investments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: investmentId, status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  };

  if (status !== "PENDING") return <span className="text-xs text-gray-400">—</span>;

  return (
    <div className="flex gap-1 justify-center">
      <Button size="sm" onClick={() => update("ACTIVE")} loading={loading} className="text-xs py-1">Aprobar</Button>
      <Button size="sm" variant="danger" onClick={() => update("CANCELLED")} loading={loading} className="text-xs py-1">Cancelar</Button>
    </div>
  );
}
