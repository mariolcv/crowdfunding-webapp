import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              InvierteHoy
            </div>
            <p className="text-sm text-gray-400">
              Plataforma de crowdfunding inmobiliario para inversores particulares.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/proyectos" className="hover:text-white transition-colors">Proyectos</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/como-funciona" className="hover:text-white transition-colors">Cómo funciona</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Mi cuenta</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
              <li><Link href="/registro" className="hover:text-white transition-colors">Registrarse</Link></li>
              <li><Link href="/dashboard/portfolio" className="hover:text-white transition-colors">Mi portfolio</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacidad" className="hover:text-white transition-colors">Política de privacidad</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Política de cookies</Link></li>
              <li><Link href="/aviso-legal" className="hover:text-white transition-colors">Aviso legal</Link></li>
              <li><Link href="/terminos" className="hover:text-white transition-colors">Términos y condiciones</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-sm text-gray-500 flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} InvierteHoy. Todos los derechos reservados.</p>
          <p>Plataforma sujeta a regulación. Invertir implica riesgos.</p>
        </div>
      </div>
    </footer>
  );
}
