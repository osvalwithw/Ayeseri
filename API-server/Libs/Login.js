// POST /LoginUser
// body: { email?: string, username?: string, password: string }
import { getDB } from './Libs/DB.js';
import { verifyPassword } from './Libs/cifr.js';

export async function LoginUser(req, res) {
  let { email, username, password } = req.body || {};
  if (!password || (!email && !username)) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  // Normaliza (email en minúsculas, quita espacios)
  email = email?.trim().toLowerCase();
  username = username?.trim();

  // Si solo recibes un campo “identificador”
  const id = req.body?.identificador?.trim();
  if (!email && !username && id) {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id);
    if (isEmail) email = id.toLowerCase();
    else username = id;
  }

  const db = getDB();
  const conn = await db.getConnection();
  try {
    const where = email ? 'email = ?' : '`Username` = ?';
    const value = email || username;

    const [rows] = await conn.execute(
      `SELECT id, \`Username\` AS username, email, password_hash
         FROM users
        WHERE ${where}
        LIMIT 1`,
      [value]
    );
    if (!rows.length) return res.status(401).json({ error: 'Credenciales inválidas' });

    const u = rows[0];
    const ok = await verifyPassword(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    return res.json({
      ok: true,
      user: { id: u.id, username: u.username, email: u.email }
    });
  } catch (e) {
    console.error('/LoginUser:', e);
    return res.status(500).json({ error: 'Error interno' });
  } finally {
    conn.release();
  }
}
