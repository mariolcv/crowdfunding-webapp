"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

const statusOptions = [
  "DRAFT", "STUDY", "OPEN_FOR_INVESTMENT", "FUNDED", "IN_RENOVATION", "FOR_SALE", "SOLD", "COMPLETED"
] as const;

type ProjectStatus = typeof statusOptions[number];

export function AdminProjectStatusUpdate({ projectId, currentStatus }: { projectId: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<ProjectStatus>(currentStatus as ProjectStatus);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    await fetch(`/api/admin/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as ProjectStatus)}
        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
      >
        {statusOptions.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <Button size="sm" onClick={handleUpdate} loading={loading} disabled={status === currentStatus}>
        Actualizar
      </Button>
    </div>
  );
}
