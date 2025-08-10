const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// Pool de conexiones a Railway (usa variables de entorno)
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,         // p. ej. ballast.proxy.rlwy.net
  port: process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : 3306,
  user: process.env.MYSQLUSER,         // p. ej. root
  password: process.env.MYSQLPASSWORD, // NO hardcodear
  database: process.env.MYSQLDATABASE, // p. ej. railway
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Healthcheck (verifica DB)
app.get('/healthz', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: rows[0].ok === 1 });
  } catch (e) {
    console.error('❌ DB Health:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Ejemplo: contar errores
app.get('/errors/count', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM errors');
    res.json({ total: rows[0].total });
  } catch (e) {
    console.error('❌ /errors/count:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Tu endpoint existente (ajustado a async/await)
app.get('/employee_errors/:id', async (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT 
      ee.ID_EE, 
      ee.Load_Date, 
      ee.Load_hour, 
      e.Error_message,
      IT.ID_Infotype
    FROM employee_errors ee
    JOIN errors e   ON ee.ID_Error = e.IDX
    JOIN infotypes IT ON e.ID_Infotype = IT.Infotype_IND
    WHERE ee.ID_EE = ?
  `;
  try {
    const [rows] = await pool.query(sql, [id]);
    if (!rows.length) return res.status(404).json({ message: 'No se encontró ningún registro con ese ID_EE' });
    res.json(rows);
  } catch (e) {
    console.error('❌ /employee_errors:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Arranque
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API escuchando en ${PORT}`);
});
