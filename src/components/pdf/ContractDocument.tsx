"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { Prisma } from "@prisma/client";

type User = Prisma.UserGetPayload<Record<string, never>>;
type Project = Prisma.ProjectGetPayload<Record<string, never>>;

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#333" },
  title: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#ddd", paddingBottom: 3 },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 160, fontWeight: "bold" },
  value: { flex: 1 },
  clause: { marginBottom: 8, lineHeight: 1.5 },
  signature: { marginTop: 30, borderTopWidth: 1, borderTopColor: "#333", paddingTop: 10 },
  signatureImg: { width: 200, height: 80 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#999" },
});

interface ContractDocumentProps {
  data: {
    user: User;
    project: Project;
    amount: number;
    signatureData: string;
  };
}

export function ContractDocument({ data }: ContractDocumentProps) {
  const { user, project, amount, signatureData } = data;
  const grossInterest = amount * (Number(project.annualRate) / 100) * (project.durationMonths / 12);
  const withholding = grossInterest * 0.19;
  const netInterest = grossInterest - withholding;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>CONTRATO DE PRÉSTAMO PARTICIPATIVO</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS DEL PRESTAMISTA (INVERSOR)</Text>
          <View style={styles.row}><Text style={styles.label}>Nombre completo:</Text><Text style={styles.value}>{user.firstName} {user.lastName}</Text></View>
          <View style={styles.row}><Text style={styles.label}>DNI/NIE:</Text><Text style={styles.value}>{user.dni}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Dirección:</Text><Text style={styles.value}>{user.address}, {user.city} {user.postalCode}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Email:</Text><Text style={styles.value}>{user.email}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS DEL PROYECTO</Text>
          <View style={styles.row}><Text style={styles.label}>Proyecto:</Text><Text style={styles.value}>{project.name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Ubicación:</Text><Text style={styles.value}>{project.location}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Tipo:</Text><Text style={styles.value}>Compra-Reforma-Venta (CRV)</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONDICIONES ECONÓMICAS</Text>
          <View style={styles.row}><Text style={styles.label}>Importe invertido:</Text><Text style={styles.value}>€{amount.toFixed(2)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Interés anual:</Text><Text style={styles.value}>{Number(project.annualRate).toFixed(2)}%</Text></View>
          <View style={styles.row}><Text style={styles.label}>Duración estimada:</Text><Text style={styles.value}>{project.durationMonths} meses</Text></View>
          <View style={styles.row}><Text style={styles.label}>Interés bruto estimado:</Text><Text style={styles.value}>€{grossInterest.toFixed(2)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Retención IRPF (19%):</Text><Text style={styles.value}>€{withholding.toFixed(2)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Interés neto estimado:</Text><Text style={styles.value}>€{netInterest.toFixed(2)}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLÁUSULAS</Text>
          <Text style={styles.clause}>
            1. El prestamista (inversor) aporta la cantidad indicada como préstamo participativo según lo establecido en el Real Decreto-ley 7/1996, de 7 de junio.
          </Text>
          <Text style={styles.clause}>
            2. La empresa prestataria se compromete a devolver el capital más los intereses generados al finalizar el proyecto o en el plazo máximo establecido.
          </Text>
          <Text style={styles.clause}>
            3. Los intereses están sujetos a retención del IRPF según la legislación vigente (19% para residentes fiscales en España).
          </Text>
          <Text style={styles.clause}>
            4. El inversor acepta el riesgo inherente a la inversión inmobiliaria. El rendimiento indicado es estimado y puede variar según el resultado final del proyecto.
          </Text>
          <Text style={styles.clause}>
            5. El presente contrato está sujeto a la legislación española y cualquier controversia se resolverá ante los tribunales competentes de España.
          </Text>
        </View>

        <View style={styles.signature}>
          <Text style={{ marginBottom: 8 }}>Firma del Inversor:</Text>
          {signatureData ? (
            <Image src={signatureData} style={styles.signatureImg} />
          ) : null}
          <Text style={{ marginTop: 8 }}>{user.firstName} {user.lastName} — {new Date().toLocaleDateString("es-ES")}</Text>
        </View>

        <Text style={styles.footer}>
          Documento generado el {new Date().toLocaleString("es-ES")} — Plataforma de Inversión Inmobiliaria
        </Text>
      </Page>
    </Document>
  );
}
