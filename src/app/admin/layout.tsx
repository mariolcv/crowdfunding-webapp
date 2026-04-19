import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, TrendingUp, Wallet, FolderOpen, Home, FileText } from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/proyectos", label: "Proyectos", icon: FolderOpen },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/inversiones", label: "Inversiones", icon: TrendingUp },
  { href: "/admin/wallet", label: "Wallet", icon: Wallet },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold">Panel Admin</span>
        </div>
        <Link href="/" className="text-sm text-purple-200 hover:text-white flex items-center gap-1">
          <Home className="h-4 w-4" /> Volver a la web
        </Link>
      </div>

      <div className="flex">
        <aside className="w-52 bg-white min-h-screen border-r border-gray-200 py-4 shrink-0">
          <nav className="space-y-1 px-2">
            {adminLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-800 transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
