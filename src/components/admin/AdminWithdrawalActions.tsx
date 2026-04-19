"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function AdminWithdrawalActions({ withdrawalId, status }: { withdrawalId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const update = async (newStatus: string) => {
    setLoading(true);
    await fetch("/api/admin/withdrawals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: withdrawalId, status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  };

  if (status === "COMPLETED" || status === "REJECTED") {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <div className="flex gap-1 justify-center">
      {status === "PENDING" && (
        <Button size="sm" variant="secondary" onClick={() => update("PROCESSING")} loading={loading} className="text-xs py-1">
          En proceso
        </Button>
      )}
      <Button size="sm" onClick={() => update("COMPLETED")} loading={loading} className="text-xs py-1">
        Completar
      </Button>
      <Button size="sm" variant="danger" onClick={() => update("REJECTED")} loading={loading} className="text-xs py-1">
        Rechazar
      </Button>
    </div>
  );
}
