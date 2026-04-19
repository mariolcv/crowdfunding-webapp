import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = { title: "Aviso Legal" };

export default function AvisoLegalPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
        <h1>Aviso Legal</h1>

        <h2>Datos identificativos</h2>
        <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico, se informa:</p>
        <ul>
          <li>Denominación social: [Tu Empresa S.L.]</li>
          <li>CIF: [B-XXXXXXXX]</li>
          <li>Domicilio social: [Dirección]</li>
          <li>Email: [contacto@tudominio.com]</li>
        </ul>

        <h2>Objeto y actividad</h2>
        <p>La presente plataforma facilita la intermediación de préstamos participativos entre inversores particulares y proyectos inmobiliarios de compra-reforma-venta, de conformidad con el Real Decreto-ley 7/1996.</p>

        <h2>Propiedad intelectual</h2>
        <p>Todos los contenidos de la plataforma están protegidos por derechos de propiedad intelectual e industrial.</p>

        <h2>Limitación de responsabilidad</h2>
        <p>La inversión en proyectos inmobiliarios conlleva riesgos. El rendimiento pasado no garantiza rendimientos futuros. Los inversores pueden perder parte o la totalidad del capital invertido.</p>
      </main>
      <Footer />
    </>
  );
}
