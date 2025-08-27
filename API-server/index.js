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
});

//status de la conexion a DB
app.get('/healthz', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: rows[0].ok === 1 });
  } catch (e) {
    console.error('DB Health error:', e); // log completo
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
  let sql = `
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
  switch(Timesel){
    case 'ToCrrDate'://To current Date
      sql += `AND ee.Load_Date <= CURDATE()`;
      break;
    case 'LstMonth'://Last month
      sql += `AND ee.Load_Date BETWEEN DATE_FORMAT (DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')
              AND LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))`;
      break;
    case 'LstWeek'://Last Week
      sql += `AND ee.load_Date BETWEEN DATE_SUB(CURDATE(), INTERVAL(WEEKDAY(CURRDATE()) + 7) DAY)
              AND DATE_SUB(CURDATE(), INTERVAL(WEEKDAY(CURDATE) + 1) DAY)`;
      break;
    case 'Today'://Today
      sql += `AND ee.Load_date = CURDATE()`;
      break;
    case 'CrrWeek'://CurrentWeek
      sql += `AND ee.Load_Date BETWEEN DATE_SUB(CURDATE(), INTERVAL WEEK(CURDATE()) DAY) AND CURDATE()`;
      break;  
    case 'CrrMonth'://Current month
      sql += `AND ee.Load_Date BETWEEN DATE_FORMAT(CURDATE(), '%Y-%m-01') AND CURDATE()`;
      break;  
    case 'CrrYear'://Current year
      sql += `AND ee.Load_Date BETWEEN DATE_FORMAT(CURDATE(), '%Y-01-01') AND CURDATE()`;
      break;
    case 'FRMCrDate'://From current date
      sql += `AND ee.Load_Date >= CURDATE()`;
      break;
    default://All
      break;
  }
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
  }catch (e){
    console.error('/Users:', e.message);
    res.status(500).json({error: e.message})
  }
});

app.get('/Requests/:NoTicket/:Username/:Email/:PSS', async (req, res) => {
  const NoTicket = req.params.NoTicket;
  const Username = req.params.Username;
  const Email = req.params.Email;
  const PSS = req.params.PSS;
//  const encrypt = await bcrypt.hash(PSS, 10);
  console.log(`${NoTicket}, ${Username}, ${Email}, ${PSS}`);
  //sql = `
  //INSERT INTO Requests (NoTicket, User, Email, Psswd)
  //VALUES (?, ?, ?, ?)`;
  //try{
  //  const [rows] = await pool.query(sql);
  //} catch {
  //  console.error('/Users:', e.message);
  //  res.status(500).json({error: e.message})
  //}
});