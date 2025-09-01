// /API-server/Emails/SendEmail.js
import { SendEmail } from '.Libs/Sndmail_lib.js';
import express from "express";

export const EmailsRouter = express.Router();

EmailsRouter.post('/SendEmail', async (req, res) => {
  try {
    const { to, subject, message } = req.body || {};
    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Faltan campos: to, subject, message' });
    }
 
    await SendEmail({ to, subject, message }); // 👈 usa tu función
    return res.json({ ok: true, sent_to: to });
  } catch (err) {
    console.error('SendEmail error:', err);
    return res.status(500).json({ error: 'No se pudo enviar el correo' });
  }
});