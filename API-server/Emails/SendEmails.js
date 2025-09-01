// /API-server/Emails/SendEmail.js
import { SendMail } from '../Libs/Sndmail_lib.js';
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
    console.log('➡️ Body recibido:', req.body);
 
    let { to, subject, message } = req.body || {};
    if (!to || !subject || message == null) { // message puede ser ''
      return res.status(400).json({ error: 'Faltan campos: to, subject, message' });
    }
 
    // fuerza a string por si te mandan un objeto/numero
    subject = String(subject);
    message = typeof message === 'string' ? message : JSON.stringify(message);
 
    const result = await SendMail({ to: String(to), subject, message });
    console.log('✅ sendMail OK', result?.messageId);
    return res.json({ ok: true, sent_to: to });
 
  } catch (err) {
    console.error('❌ SendEmail error:', err);
    return res.status(500).json({ error: 'Fallo al enviar el correo' });
  }
});

EmailsRouter.get('/ping', (req, res) => 
    res.json({ok: true}));