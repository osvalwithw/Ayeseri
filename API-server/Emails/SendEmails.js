// // /API-server/Emails/SendEmail.js
// import { SendMail } from '../Libs/Sndmail_lib.js';
// import express from "express";

// export const EmailsRouter = express.Router();

// // CORS básico por si tu front está en otro dominio
// EmailsRouter.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//   if (req.method === 'OPTIONS') return res.sendStatus(200);
//   next();
// });
 
// // POST /Emails/SendEmail
// EmailsRouter.post('/SendEmail', async (req, res) => {
//   try {
//     console.log('Body recibido:', req.body);
 
//     let { to, subject, message } = req.body || {};
//     if (!to || !subject || message == null) { // message puede ser ''
//       return res.status(400).json({ error: 'Faltan campos: to, subject, message' });
//     }
 
//     // fuerza a string por si te mandan un objeto/numero
//     subject = String(subject);
//     message = typeof message === 'string' ? message : JSON.stringify(message);
 
//     const result = await SendMail({ to: String(to), subject, message });
//     console.log('sendMail OK', result?.messageId);
//     return res.json({ ok: true, sent_to: to });
 
//   } catch (err) {
//     console.error('SendEmail error:', err);
//     return res.status(500).json({ error: 'Fallo al enviar el correo' });
//   }
// });

// EmailsRouter.get('/ping', (req, res) => 
//     res.json({ok: true}));

// /API-server/Emails/SendEmail.js
import express from "express";
import { SendMail /*, verifyTransport */ } from "../Libs/Sndmail_lib.js";

// Si en tu lib exportaste verifyTransport(), descomenta e importa arriba
// y descomenta el endpoint /Emails/smtp-verify más abajo.

export const EmailsRouter = express.Router();

// --- Body parser (por si el app.use(express.json()) no está en el server root) ---
EmailsRouter.use(express.json({ limit: "200kb", strict: true }));

// --- CORS básico (ajusta el Origin en prod) ---
EmailsRouter.use((req, res, next) => {
  // Cambia '*' por tu dominio en producción: e.g. 'https://tu-frontend.com'
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// --- Helpers de validación ---
const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i; // simple y suficiente para server-side

const MAX_SUBJECT = 200;   // evita subjects gigantes
const MAX_MESSAGE = 5000;  // limita tamaño de mensaje

function sanitizeStr(v, maxLen) {
  const s = String(v ?? "").trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

// --- Ping básico ---
EmailsRouter.get("/ping", (_req, res) => {
  res.json({ ok: true });
});

// (Opcional) Verificación SMTP on-demand para diagnóstico en dev
// GET /Emails/smtp-verify
// EmailsRouter.get("/smtp-verify", async (_req, res) => {
//   try {
//     const ok = await verifyTransport();
//     return res.json({ ok });
//   } catch (err) {
//     console.error("SMTP verify route error:", err);
//     return res.status(500).json({ ok: false, error: "SMTP verify failed" });
//   }
// });

// --- POST /Emails/SendEmail ---
EmailsRouter.post("/SendEmail", async (req, res) => {
  try {
    // Asegura body
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "Body inválido o vacío" });
    }

    let { to, subject, message } = req.body;

    // Validaciones mínimas
    if (!to || !emailRegex.test(String(to))) {
      return res.status(400).json({ error: "Destinatario 'to' inválido" });
    }
    if (subject == null || subject === "") {
      return res.status(400).json({ error: "Falta 'subject'" });
    }
    if (message == null) {
      return res.status(400).json({ error: "Falta 'message'" });
    }

    // Normaliza / limita tamaños
    subject = sanitizeStr(subject, MAX_SUBJECT);
    message =
      typeof message === "string"
        ? sanitizeStr(message, MAX_MESSAGE)
        : sanitizeStr(JSON.stringify(message), MAX_MESSAGE);

    // Enviar
    const result = await SendMail({
      to: String(to).trim(),
      subject,
      message,
    });

    // Respuesta útil hacia el cliente
    return res.json({
      ok: true,
      sent_to: to,
      messageId: result?.messageId,
      accepted: result?.accepted,
      rejected: result?.rejected,
    });
  } catch (err) {
    // Mapea errores comunes de Nodemailer para mejores diagnósticos del front
    const code = err?.code || err?.errno || err?.responseCode;
    const name = err?.name;
    const hint =
      code === "EAUTH"
        ? "Fallo de autenticación SMTP (revisa usuario/contraseña o App Password)."
        : code === "ETIMEDOUT" || code === "ESOCKET" || code === "ECONNECTION"
        ? "No se pudo abrir la conexión SMTP (puerto bloqueado/TLS/IPv4)."
        : name === "HostnameError"
        ? "No se pudo resolver el host SMTP (DNS)."
        : undefined;

    console.error("SendEmail error:", err);

    return res.status(500).json({
      error: "Fallo al enviar el correo",
      code,
      hint,
    });
  }
});

export default EmailsRouter;
