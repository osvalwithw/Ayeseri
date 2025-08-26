const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : 3306,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Activa SSL si lo necesitas (p.ej., PlanetScale requiere; Railway a veces no)
  ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});


app.get('/healthz', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: rows[0].ok === 1 });
  } catch (e) {
    console.error('❌ DB Health error:', e); // log completo
    res.status(500).json({ ok: false, error: e.message || String(e) });
  }
});

app.get('/errors/count', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM errors');
    res.json({ total: rows[0].total });
  } catch (e) {
    console.error('❌ /errors/count error:', e);
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.get('/employee_errors/:id/:timepar', async (req, res) => {
  const id = req.params.id;
  const Timesel = req.params.timepar;
  //const page = Number.parseInt(req.query.page ?? '1', 10) || 1;
  //const limit = Number(req.query.limit ?? '200', 10)|| 200;
  //const offset = (page - 1) * limit;
  const sql = `
    SELECT 
      ee.ID_EE, 
      ee.Load_Date, 
      ee.Load_hour, 
      e.Error_message,
      IT.ID_Infotype AS ID_Infotype
    FROM employee_errors ee
    JOIN errors e ON ee.ID_Error = e.IDX
    lEFT JOIN infotypes IT ON e.ID_Infotype = IT.Infotype_IND
    WHERE ee.ID_EE = ?`;
  const SearchTimeId = [id];
  console.log("Aqui vamos bien");
  //SearchTimeId.push(limit, offset);
  try {
    const [rows] = await pool.query(sql, SearchTimeId);
    if (!rows.length) return res.status(404).json({ message: 'No se encontró ningún registro, revisa la informacion ingresada' });
    res.json({id, Timesel, rows});
  } catch (e) {
    console.error('Error en /employee_errors:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Arranque
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API escuchando en ${PORT}`);
});

app.get('/Users', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM Users`);
    res.json(rows);
  } catch (e){
    console.error('/Users:', e.message);
    res.status(500).json({error: e.message})
  }
});