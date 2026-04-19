import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = { title: "Política de Privacidad" };

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
        <h1>Política de Privacidad</h1>
        <p className="lead">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

        <h2>1. Responsable del tratamiento</h2>
        <p>El responsable del tratamiento de datos personales es la empresa titular de esta plataforma, en adelante &quot;la Empresa&quot;.</p>

        <h2>2. Datos que recopilamos</h2>
        <ul>
          <li>Datos de identificación: nombre, apellidos, DNI/NIE, fecha de nacimiento</li>
          <li>Datos de contacto: email, teléfono, dirección postal</li>
          <li>Datos bancarios: IBAN para realizar devoluciones</li>
          <li>Datos de navegación: cookies técnicas para el funcionamiento de la plataforma</li>
          <li>Datos de inversión: importes, fechas, documentos contractuales</li>
        </ul>

        <h2>3. Finalidad del tratamiento</h2>
        <ul>
          <li>Gestión del registro y autenticación de usuarios</li>
          <li>Verificación de identidad (KYC) según normativa aplicable</li>
          <li>Gestión de inversiones y contratos de préstamo participativo</li>
          <li>Comunicaciones relacionadas con su actividad inversora</li>
          <li>Cumplimiento de obligaciones legales y fiscales (retenciones IRPF)</li>
        </ul>

        <h2>4. Base legal</h2>
        <p>El tratamiento se basa en la ejecución del contrato, el cumplimiento de obligaciones legales y el interés legítimo de la empresa.</p>

        <h2>5. Conservación de datos</h2>
        <p>Los datos se conservarán durante la relación contractual y el plazo legalmente exigido (mínimo 5 años para documentación fiscal).</p>

        <h2>6. Derechos</h2>
        <p>Puede ejercer sus derechos de acceso, rectificación, supresión, portabilidad y oposición contactando con nosotros. También puede solicitar la eliminación de su cuenta desde el panel de usuario.</p>

        <h2>7. Contacto</h2>
        <p>Para cualquier consulta sobre privacidad, contáctenos en el email indicado en el aviso legal.</p>
      </main>
      <Footer />
    </>
  );
}
