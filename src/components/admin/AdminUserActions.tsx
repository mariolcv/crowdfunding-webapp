"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface AdminUserActionsProps {
  userId: string;
  kycStatus: string;
  isBlocked: boolean;
  role: string;
}

export function AdminUserActions({ userId, kycStatus, isBlocked, role }: AdminUserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const update = async (data: Record<string, unknown>) => {
    setLoading(true);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, ...data }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {kycStatus === "PENDING" && (
        <>
          <Button size="sm" onClick={() => update({ kycStatus: "APPROVED" })} loading={loading} className="text-xs py-1">
            Aprobar KYC
          </Button>
          <Button size="sm" variant="danger" onClick={() => update({ kycStatus: "REJECTED" })} loading={loading} className="text-xs py-1">
            Rechazar
          </Button>
        </>
      )}
      {kycStatus === "REJECTED" && (
        <Button size="sm" onClick={() => update({ kycStatus: "APPROVED" })} loading={loading} className="text-xs py-1">
          Aprobar KYC
        </Button>
      )}
      <Button
        size="sm"
        variant={isBlocked ? "secondary" : "outline"}
        onClick={() => update({ isBlocked: !isBlocked })}
        loading={loading}
        className="text-xs py-1"
      >
        {isBlocked ? "Desbloquear" : "Bloquear"}
      </Button>
      {role !== "ADMIN" && (
        <Button size="sm" variant="ghost" onClick={() => update({ role: "ADMIN" })} loading={loading} className="text-xs py-1">
          Hacer admin
        </Button>
      )}
    </div>
  );
}
