import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`;

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Bienvenido a la plataforma de inversión",
    html: `<p>Hola ${name},</p><p>Tu cuenta ha sido creada correctamente. Completa tu perfil para poder invertir.</p>`,
  });
}

export async function sendDepositConfirmedEmail(
  to: string,
  name: string,
  amount: number,
  ref: string
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Depósito recibido y confirmado",
    html: `<p>Hola ${name},</p><p>Hemos recibido tu transferencia de <strong>€${amount.toFixed(2)}</strong> con referencia <strong>${ref}</strong>. El saldo ya está disponible en tu wallet.</p>`,
  });
}

export async function sendInvestmentApprovedEmail(
  to: string,
  name: string,
  projectName: string,
  amount: number,
  contractUrl: string
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Tu inversión ha sido aprobada",
    html: `<p>Hola ${name},</p><p>Tu inversión de <strong>€${amount.toFixed(2)}</strong> en el proyecto <strong>${projectName}</strong> ha sido aprobada.</p><p><a href="${contractUrl}">Descargar contrato firmado</a></p>`,
  });
}

export async function sendProjectUpdateEmail(
  to: string,
  name: string,
  projectName: string,
  updateTitle: string,
  projectUrl: string
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Nueva actualización en ${projectName}`,
    html: `<p>Hola ${name},</p><p>Hay una nueva actualización en el proyecto <strong>${projectName}</strong>: <em>${updateTitle}</em>.</p><p><a href="${projectUrl}">Ver actualización</a></p>`,
  });
}

export async function sendProjectCompletedEmail(
  to: string,
  name: string,
  projectName: string,
  amount: number,
  grossInterest: number,
  withholding: number,
  netInterest: number
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Proyecto ${projectName} completado - Retorno procesado`,
    html: `
      <p>Hola ${name},</p>
      <p>El proyecto <strong>${projectName}</strong> ha finalizado. Aquí está el desglose de tu retorno:</p>
      <ul>
        <li>Capital: €${amount.toFixed(2)}</li>
        <li>Interés bruto: €${grossInterest.toFixed(2)}</li>
        <li>Retención IRPF (19%): €${withholding.toFixed(2)}</li>
        <li><strong>Interés neto: €${netInterest.toFixed(2)}</strong></li>
        <li><strong>Total recibido: €${(amount + netInterest).toFixed(2)}</strong></li>
      </ul>
      <p>El importe ya ha sido acreditado en tu wallet.</p>
    `,
  });
}

export async function sendWithdrawalCompletedEmail(
  to: string,
  name: string,
  amount: number,
  iban: string
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Retiro procesado",
    html: `<p>Hola ${name},</p><p>Tu solicitud de retirada de <strong>€${amount.toFixed(2)}</strong> ha sido procesada. El dinero será transferido a tu cuenta ${iban.slice(-4).padStart(iban.length, "*")}.</p>`,
  });
}
