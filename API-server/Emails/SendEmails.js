// /API-server/Emails/SendEmail.js
import { SendEmail } from '../Libs/Sndmail_lib.js';
import express from "express";

export const EmailsRouter = express.Router();

// CORS básico por si tu front está en otro dominio
EmailsRouter.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
 
// POST /Emails/SendEmail
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