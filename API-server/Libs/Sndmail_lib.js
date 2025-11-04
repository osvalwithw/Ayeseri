// import nodemailer from 'nodemailer';
 
// let _transporter;
// function getTransporter() {
//   if (_transporter) return _transporter;
//   const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env; //Variables de la API (revisar su contenido en la pagina)
//   _transporter = nodemailer.createTransport({
//     host: SMTP_HOST,
//     port: Number(SMTP_PORT || 587),
//     secure: String(SMTP_PORT) === '465',
//     auth: { user: SMTP_USER, pass: SMTP_PASS }
//   });
//   return _transporter;
// }
 
// export async function SendMail({ to, subject, message }) {
//   const transporter = getTransporter();
 
//   // Normaliza
//   const safeTo = String(to ?? '');
//   const safeSubject = String(subject ?? '');
//   const safeMsg = typeof message === 'string' ? message : JSON.stringify(message ?? '');
 
//   const html = `
//     <div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;line-height:1.5">
//       <p>${escapeHtml(safeMsg).replace(/\n/g, '<br/>')}</p>
//     </div>
//   `;
 
//   return transporter.sendMail({
//     from: process.env.MAIL_FROM || 'ayesericonnect@gmail.com',
//     to: safeTo,
//     subject: safeSubject,
//     text: stripHtml(html),   // fallback texto plano
//     html
//   });
// }
 
// // Helpers seguros
// function stripHtml(html = '') {
//   return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
// }
// function escapeHtml(s = '') {
//   s = String(s);
//   return s
//     .replaceAll('&','&amp;')
//     .replaceAll('<','&lt;')
//     .replaceAll('>','&gt;')
//     .replaceAll('"','&quot;')
//     .replaceAll("'",'&#039;');
// }

// function stripHTML(html){
//     return html.replace(/<[~^*¨]/g, '  ').replace(/\s+/g, '  ').trim();
// }
// mailer.js (ESM)
// node mailer.js test to=destino@dominio.com subject="Hola" message="Probando verificación y envío"

// ../Libs/Sndmail_lib.js
// /API-server/Libs/Sndmail_lib.js
import { Resend } from 'resend';

// Helpers
function stripHtml(html = '') {
  return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
function escapeHtml(s = '') {
  s = String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
  return s;
}

// Inicializa cliente Resend
let resend;
function getClient() {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Falta la variable RESEND_API_KEY en el entorno.');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// === Envío principal ===
export async function SendMail({ to, subject, message, from }) {
  const client = getClient();

  if (!to || !subject || message == null) {
    throw new Error('Faltan campos: to, subject, message');
  }

  const safeTo = String(to).trim();
  const safeSubject = String(subject).trim();
  const safeMsg =
    typeof message === 'string' ? message : JSON.stringify(message ?? '');

  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;line-height:1.5">
      <p>${escapeHtml(safeMsg).replace(/\n/g, '<br/>')}</p>
    </div>
  `;

  // Mientras tu dominio se verifica, usamos el dominio temporal de Resend
  const sender =
    from || process.env.MAIL_FROM || 'Ayeseri <no-reply@resend.dev>';

  const response = await client.emails.send({
    from: sender,
    to: safeTo,
    subject: safeSubject,
    html,
    text: stripHtml(html),
  });

  console.log('Resend sendMail result:', {
    id: response?.data?.id,
    error: response?.error || null,
  });

  if (response.error) throw new Error(response.error.message);

  return response.data;
}