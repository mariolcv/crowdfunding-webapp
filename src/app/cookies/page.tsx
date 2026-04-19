import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = { title: "Política de Cookies" };

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
        <h1>Política de Cookies</h1>

        <h2>¿Qué son las cookies?</h2>
        <p>Las cookies son pequeños ficheros que se almacenan en su dispositivo cuando visita un sitio web.</p>

        <h2>Cookies que utilizamos</h2>
        <table>
          <thead><tr><th>Nombre</th><th>Tipo</th><th>Finalidad</th><th>Duración</th></tr></thead>
          <tbody>
            <tr><td>next-auth.session-token</td><td>Técnica</td><td>Autenticación de sesión</td><td>Sesión</td></tr>
            <tr><td>cookie-consent</td><td>Técnica</td><td>Guardar preferencias de cookies</td><td>1 año</td></tr>
          </tbody>
        </table>

        <h2>Gestión de cookies</h2>
        <p>Puede rechazar o eliminar cookies desde la configuración de su navegador o usando el banner de cookies al acceder a la plataforma.</p>
      </main>
      <Footer />
    </>
  );
}
