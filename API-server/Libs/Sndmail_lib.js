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
import nodemailer from 'nodemailer';

// ===== Helpers de saneo =====
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

// ===== Transporter singleton =====
let _transporter;
let _verifiedOnce = false; // cachea verify() por proceso

export function getTransporter() {
  if (_transporter) return _transporter;

  const {
    SMTP_HOST,
    SMTP_PORT = '587',
    SMTP_USER,
    SMTP_PASS,
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      'Faltan variables SMTP_HOST, SMTP_USER o SMTP_PASS. Define tu entorno antes de continuar.'
    );
  }

  const port = Number(SMTP_PORT);
  const isSecure465 = String(SMTP_PORT) === '465'; // 465 = SMTPS (TLS directo). 587 = STARTTLS.

  _transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: isSecure465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },

    // --- Anti-timeout y diagnóstico claro ---
    connectionTimeout: 15000, // tiempo para abrir socket
    greetingTimeout:   10000, // tiempo para recibir banner SMTP
    socketTimeout:     20000, // tiempo total de operación

    // En DEV puedes dejarlo en true; en PROD ponlo false si ensucia logs
    debug: true,

    // Evita líos con IPv6 en contenedores PaaS
    family: 4,

    // STARTTLS obligatorio cuando uses 587
    requireTLS: !isSecure465,

    // TLS moderno y SNI correcto
    tls: {
      minVersion: 'TLSv1.2',
      servername: SMTP_HOST,
      // Si tu proveedor tiene CA correcta, no toques rejectUnauthorized.
      // rejectUnauthorized: false,
    },
  });

  return _transporter;
}

// ===== Verificación explícita (te dice dónde truena) =====
export async function verifyTransport(force = false) {
  const t = getTransporter();

  // Evita repetir verify() en cada request. Úsalo una vez y cachea.
  if (_verifiedOnce && !force) return true;

  try {
    console.log('Verifying SMTP connectivity/auth...');
    const ok = await t.verify();
    console.log('SMTP verify OK ✅', ok);
    _verifiedOnce = true;
    return true;
  } catch (err) {
    console.error('SMTP verify failed ❌');
    // Suele traer "ECONNECTION" (no abre socket), "ETIMEDOUT", "EAUTH" (credenciales),
    // o errores de certificado/handshake TLS.
    console.error(err);
    _verifiedOnce = false;
    return false;
  }
}

// ===== Envío de correo (nombre público que espera tu router) =====
export async function SendMail({ to, subject, message, from }) {
  const t = getTransporter();

  // Verifica una vez por proceso para mejores mensajes de error
  const ok = await verifyTransport();
  if (!ok) {
    throw new Error('SMTP verification failed (posible puerto/TLS/AUTH). Revisa logs.');
  }

  const safeTo = String(to ?? '').trim();
  const safeSubject = String(subject ?? '').trim();
  const safeMsg = typeof message === 'string' ? message : JSON.stringify(message ?? '');

  if (!safeTo) throw new Error('Falta el destinatario "to".');

  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;line-height:1.5">
      <p>${escapeHtml(safeMsg).replace(/\n/g, '<br/>')}</p>
    </div>
  `;

  const response = await t.sendMail({
    from: from || process.env.MAIL_FROM || process.env.SMTP_USER,
    to: safeTo,
    subject: safeSubject || 'Mensaje Ayeseri',
    text: stripHtml(html),
    html,
  });

  // Log útil (no imprime contenido)
  console.log('sendMail result:', response && {
    accepted: response.accepted,
    rejected: response.rejected,
    response: response.response,
    messageId: response.messageId,
  });

  return response;
}

// ===== Runner CLI para pruebas rápidas =====
// Guarda este archivo también como ejecutable de test si quieres:
//   node Sndmail_lib.js verify
//   node Sndmail_lib.js test to=destino@dominio.com subject="Hola" message="Probando"
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , cmd, ...args] = process.argv;

  const kv = Object.fromEntries(
    args
      .map(p => p.split('=')) // ["to=alguien@dominio", "subject=Hola"]
      .filter(x => x.length === 2)
  );

  (async () => {
    try {
      if (cmd === 'verify') {
        const ok = await verifyTransport(true); // force para ver ahora mismo
        process.exit(ok ? 0 : 1);
      } else if (cmd === 'test') {
        const res = await SendMail({
          to: kv.to,
          subject: kv.subject || 'Prueba Ayeseri',
          message: kv.message || 'Esto es una prueba de verificación + envío ✅',
          from: kv.from, // opcional
        });
        console.log('OK, enviado. MessageId:', res?.messageId);
        process.exit(0);
      } else {
        console.log(
`Uso:
  node Sndmail_lib.js verify
  node Sndmail_lib.js test to=destino@dominio.com subject="Hola" message="Probando"`
        );
        process.exit(0);
      }
    } catch (e) {
      console.error('Error:', e);
      process.exit(1);
    }
  })();
}
