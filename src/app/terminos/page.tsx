import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = { title: "Términos y Condiciones" };

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
        <h1>Términos y Condiciones</h1>
        <p className="lead">Al registrarse y usar la plataforma, el usuario acepta los presentes términos.</p>

        <h2>1. Servicio</h2>
        <p>La plataforma facilita la participación en préstamos participativos vinculados a proyectos inmobiliarios. No es una entidad financiera regulada como banco o aseguradora.</p>

        <h2>2. Requisitos del inversor</h2>
        <ul>
          <li>Ser mayor de 18 años</li>
          <li>Residir fiscalmente en España (salvo acuerdos especiales)</li>
          <li>Completar el proceso KYC satisfactoriamente</li>
          <li>Disponer de saldo suficiente en la wallet antes de invertir</li>
        </ul>

        <h2>3. Inversiones</h2>
        <p>Las inversiones se formalizan mediante contrato de préstamo participativo. La aprobación de cada inversión queda sujeta a la validación del administrador de la plataforma.</p>

        <h2>4. Riesgos</h2>
        <p>Toda inversión conlleva riesgo de pérdida parcial o total del capital. Los rendimientos indicados son estimaciones, no garantías.</p>

        <h2>5. Fiscalidad</h2>
        <p>Los intereses generados están sujetos a retención del IRPF (19% residentes) conforme a la legislación española vigente. El inversor es responsable de declarar los rendimientos en su declaración de la renta.</p>

        <h2>6. Cancelación</h2>
        <p>Una vez aprobada una inversión, no podrá cancelarse salvo decisión del administrador de la plataforma.</p>

        <h2>7. Ley aplicable</h2>
        <p>Los presentes términos se rigen por la legislación española. Cualquier controversia se someterá a los tribunales competentes de España.</p>
      </main>
      <Footer />
    </>
  );
}
