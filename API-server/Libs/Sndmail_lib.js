import nodemailer from 'nodemailer';
 
let _transporter;
function getTransporter() {
  if (_transporter) return _transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  _transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_PORT) === '465',
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  return _transporter;
}
 
export async function sendMail({ to, subject, message }) {
  const transporter = getTransporter();
 
  // 🔒 Normaliza y escapa SIEMPRE
  const safeTo = String(to ?? '');
  const safeSubject = String(subject ?? '');
  const safeMsg = typeof message === 'string' ? message : JSON.stringify(message ?? '');
 
  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;line-height:1.5">
      <p>${escapeHtml(safeMsg).replace(/\n/g, '<br/>')}</p>
    </div>
  `;
 
  return transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@tu-dominio.com',
    to: safeTo,
    subject: safeSubject,
    text: stripHtml(html),   // fallback texto plano
    html
  });
}
 
// Helpers seguros
function stripHtml(html = '') {
  return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
function escapeHtml(s = '') {
  s = String(s);
  return s
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function stripHTML(html){
    return html.replace(/<[~^*¨]/g, '  ').replace(/\s+/g, '  ').trim();
}