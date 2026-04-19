"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Menu, X, TrendingUp, ChevronDown } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-blue-800 text-lg">
              <TrendingUp className="h-6 w-6" />
              <span>InvierteHoy</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/proyectos" className="text-sm text-gray-600 hover:text-blue-800 font-medium">Proyectos</Link>
              <Link href="/blog" className="text-sm text-gray-600 hover:text-blue-800 font-medium">Blog</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-800 font-medium"
                >
                  {session.user?.name || session.user?.email}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Panel</Link>
                    <Link href="/dashboard/portfolio" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Mi Portfolio</Link>
                    <Link href="/dashboard/wallet" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Mi Wallet</Link>
                    <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Mi Perfil</Link>
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-100 my-1" />
                        <Link href="/admin" className="block px-4 py-2 text-sm text-purple-700 hover:bg-gray-50 font-medium" onClick={() => setUserMenuOpen(false)}>Panel Admin</Link>
                      </>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Iniciar sesión</Button>
                </Link>
                <Link href="/registro">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-3">
          <Link href="/proyectos" className="block text-sm text-gray-700 py-2" onClick={() => setMobileOpen(false)}>Proyectos</Link>
          <Link href="/blog" className="block text-sm text-gray-700 py-2" onClick={() => setMobileOpen(false)}>Blog</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="block text-sm text-gray-700 py-2" onClick={() => setMobileOpen(false)}>Panel</Link>
              <Link href="/dashboard/portfolio" className="block text-sm text-gray-700 py-2" onClick={() => setMobileOpen(false)}>Mi Portfolio</Link>
              <Link href="/dashboard/wallet" className="block text-sm text-gray-700 py-2" onClick={() => setMobileOpen(false)}>Mi Wallet</Link>
              {isAdmin && <Link href="/admin" className="block text-sm text-purple-700 py-2 font-medium" onClick={() => setMobileOpen(false)}>Panel Admin</Link>}
              <button onClick={() => signOut({ callbackUrl: "/" })} className="block text-sm text-red-600 py-2">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block" onClick={() => setMobileOpen(false)}><Button variant="outline" className="w-full">Iniciar sesión</Button></Link>
              <Link href="/registro" className="block" onClick={() => setMobileOpen(false)}><Button className="w-full">Registrarse</Button></Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
