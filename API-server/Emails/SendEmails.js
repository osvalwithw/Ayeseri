// /API-server/api/send-email.js
import { sendMail } from './lib/mailer.js';
 
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
 
  try {
    const { to, subject, message } = req.body || {};
    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Faltan campos' });
    }
 
    await sendMail({
      to,
      subject,
      html: `<p>${message}</p>`
    });
 
    res.json({ ok: true, sent_to: to });
  } catch (err) {
    console.error('send-email error:', err);
    res.status(500).json({ error: 'No se pudo enviar el correo' });
  }
}