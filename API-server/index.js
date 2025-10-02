import { getDB } from './Libs/DB.js';   //conexion a bse de datos
import express from 'express';
import cors from'cors';
import { EmailsRouter } from './Emails/SendEmails.js';
import axios from 'axios';
import e from 'express';

const app = express();
app.use(cors());
app.use(express.json());

const pool = getDB();                   //conexion a bse de datos

//status de la conexion a bse de datos
app.get('/healthz', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: rows[0].ok === 1 });
  } catch (e) {
    console.error('DB Health error:', e); // log completo
    res.status(500).json({ ok: false, error: e.message || String(e) });
  }
});

app.get('/getErrors', async (req, res) => {
  const sql = `
      SELECT 
      e.IDX AS ID_Error,
      e.Error_Message,
      i.ID_Infotype AS ID_Infotype,
      i.Infotype_IND AS Infotype_IDX
      FROM errors e
      JOIN infotypes i ON e.ID_Infotype = i.Infotype_IND`;
  try{
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (e) {
    console.error('API connection failure', e);
    res.status(500).json({error: e.message || String(e)});
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
  const timeparams = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourformat: true
  };
  const ActualTimeFunc = new Intl.DateTimeFormat('es-MX', timeparams);
  const Actualtime = ActualTimeFunc.format(newDate());
  const PSS = req.params.PSS;
  const params = [NoTicket, Username, Email, PSS, Actualtime];
  //const encrypt = await bcrypt.hash(PSS, 10);
  console.log(`${NoTicket}, ${Username}, ${Email}, ${PSS}, ${Actualtime}`);
  sql = `
  INSERT INTO Requests (NoTicket, User, Email, Psswd, Upload_Time)
  VALUES (?, ?, ?, ?, ?)`;
  try{
    const [rows] = await pool.query(sql, params);
  } catch (e){
    console.error('/Requests:', e.message);
    res.status(500).json({error: e.message});
  }
});

app.get('/Requests', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM Requests`);
    res.json(rows);
  }catch (e){
    console.error('/Request:', e.message);
    res.status(500).json({error: e.message})
  }
});

app.use('/Emails', EmailsRouter);

app.get('/GetTickets', async (req, res) => {
  try{
    const[rows] = await pool.query(`SELECT * FROM Requests`)
    res.json(rows);
  } catch (e){
     console.error('/Request:', e.message);
     res.status(500).json({error: e.message});
  }
});

app.post('/CreateUsers/:OPC', async (req, res) => {
  const OPC = req.params.OPC;
    const { SendTickets } = req.body
    if (!SendTickets || !Array.isArray(SendTickets) || SendTickets.length === 0) {
      return res.status(400).json({ error: 'El campo "SendTickets" es requerido y debe ser un array no vacío.' });
    }
  if(OPC == 1){
    try{  
      const insertPromises = SendTickets.map(ticket => {
        const { usuario, email, id, pss } = ticket;
        console.log(`Procesando ticket ID: ${id}, Usuario: ${usuario}, Email: ${email}, Pss: ${pss}`);
        const sql = `INSERT INTO Users (Email, Password, Username) VALUES (?, ?, ?)`;
        return pool.query(sql, [email, pss, usuario])
          .then(() => {
            const deleteSql = `DELETE FROM Requests WHERE id = ?`;
            return pool.query(deleteSql, [id]);
          });
      });
      await Promise.all(insertPromises);
      res.json({ message: 'Usuarios creados y tickets eliminados exitosamente.' });
    } catch (e){
        console.error('/CreateUsers:', e.message);
        res.status(500).json({error: e.message});    
    }
  } else {
    const DeletePromises = SendTickets.map(ticket => {
        const { usuario, email, id, pss } = ticket;
        console.log(`Procesando ticket ID: ${id}, Usuario: ${usuario}, Email: ${email}, Pss: ${pss}`);
        const deleteSql = `DELETE FROM Requests WHERE id = ?`;
        return pool.query(deleteSql, [id])});
  }
});

//IA Section-----------------------------------------------------------------------------------------------------

app.post('/api/ThinkingMethod', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'El campo "query" es requerido' });
  }

  console.log(`Recibida pregunta para la IA: "${query}"`);

  try {
    const aiServiceResponse = await axios.post('https://oswal2-ayeseri-is-thinking.hf.space/ThinkingMethod', {
      query: query  // Envio
    });

    console.log('Respuesta recibida:', aiServiceResponse.data);
    
    // Reenvio
    res.json(aiServiceResponse.data);

  } catch (e) {
    console.error('❌ Error al conectar con el servicio de IA:', e.message);
    res.status(500).json({ error: 'No se pudo contactar al asistente de IA.' });
  }
});

//IA Clasifying Section-----------------------------------------------------------------------------------------------------
app.post('/InsertErrors', async (req, res) =>{
  console.log(req.body);
  try {
    const Toload = Array.isArray(req.body) ? req.body : [req.body];
    if (!Toload || !Array.isArray(Toload) || Toload.length === 0) {
    return res.status(400).json({ error: 'El campo "Toload" es requerido y debe ser un array no vacío.' });
    }
    const insertPromises = Toload.map(error => {
      const { Error_Message, ID_Infotype } = error;
      console.log(`Procesando Error: ${Error_Message}, Infotype: ${ID_Infotype}`);
      const sql = `INSERT INTO errors (Error_message, ID_Infotype) VALUES (?, ?)`;
      return pool.query(sql, [Error_Message, ID_Infotype]);
    });
    await Promise.all(insertPromises);
    res.json({ message: 'Errores insertados exitosamente.' });
  } catch (e){
    console.error('/InsertErrors:', e.message);
    res.status(500).json({error: e.message});
  }
});

app.post('/EEInsertErrors', async (req, res) =>{
  const { Toload } = req.body;
  if (!Toload || !Array.isArray(Toload) || Toload.length === 0) {
    return res.status(400).json({ error: 'El campo "Toload" es requerido y debe ser un array no vacío.' });
  }
  try {
    const insertPromises = Toload.map(error => {
      const { ID_EE, ID_Error, Load_Date, Load_hour } = error;
      console.log(`Procesando Error para: ${ID_EE}, Infotype: ${ID_Infotype}, `);
      const sql = `INSERT INTO employee_errors (ID_EE, ID_Error, Load_Date, Load_hour) VALUES (%s, %s, %s, %s)`;
      return pool.query(sql, [ID_EE, ID_Error, Load_Date, Load_hour]);
    });
    await Promise.all(insertPromises);
    res.json({ message: 'Errores de EE insertados exitosamente.' });
  } catch (e){
    console.error('/InsertErrors:', e.message);
    res.status(500).json({error: e.message});
  }
});

// Arranque
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API escuchando en ${PORT}`);
});