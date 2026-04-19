import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "purple";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  purple: "bg-purple-100 text-purple-800",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    DRAFT: { label: "Borrador", variant: "default" },
    STUDY: { label: "En estudio", variant: "info" },
    OPEN_FOR_INVESTMENT: { label: "Abierto", variant: "success" },
    FUNDED: { label: "Financiado", variant: "purple" },
    IN_RENOVATION: { label: "En obra", variant: "warning" },
    FOR_SALE: { label: "En venta", variant: "info" },
    SOLD: { label: "Vendido", variant: "success" },
    COMPLETED: { label: "Completado", variant: "success" },
  };
  const config = map[status] || { label: status, variant: "default" as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function InvestmentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    PENDING: { label: "Pendiente", variant: "warning" },
    ACTIVE: { label: "Activa", variant: "success" },
    COMPLETED: { label: "Completada", variant: "info" },
    CANCELLED: { label: "Cancelada", variant: "danger" },
  };
  const config = map[status] || { label: status, variant: "default" as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function KycStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    PENDING: { label: "Pendiente KYC", variant: "warning" },
    APPROVED: { label: "KYC Aprobado", variant: "success" },
    REJECTED: { label: "KYC Rechazado", variant: "danger" },
  };
  const config = map[status] || { label: status, variant: "default" as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
