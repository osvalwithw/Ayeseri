import { getDB } from './Libs/DB.js';   //conexion a bse de datos
import express from 'express';
import cors from'cors';
import { EmailsRouter } from './Emails/SendEmails.js';
import axios from 'axios';
import 'dotenv/config.js';
import { hashPassword } from './Libs/cifr.js';
import { LoginUser } from './Libs/Login.js';
import { promises as fs } from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

const pool = getDB();                   //conexion a bse de datos

app.post('/LoginUser', LoginUser);

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

app.get('/SingleUser/:Username', async (req, res) => {
  const Username = req.params.Username;
  const sql = `
      SELECT u.email, u.Username, u.PSSFlagchange, u.UserRole FROM Users u
      WHERE u.Username = ?`;
  try {
    const [rows] = await pool.query(sql, Username);
    res.json(rows);
  }catch (e){
    console.error('/Users:', e.message);
    res.status(500).json({error: e.message})
  }
});

app.get('/NewRequests/:NoTicket/:Username/:Email/:PSS', async (req, res) => {
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
  const Actualtime = ActualTimeFunc.format(new Date());
  const PSS = req.params.PSS;
  const params = [NoTicket, Username, Email, PSS, Actualtime];
  //const encrypt = await bcrypt.hash(PSS, 10);
  console.log(`${NoTicket}, ${Username}, ${Email}, ${PSS}, ${Actualtime}`);
  const sql = `
  INSERT INTO Requests (NoTicket, User, Email, Psswd, Upload_Time)
  VALUES (?, ?, ?, ?, ?)`;
  try{
    const [rows] = await pool.query(sql, params);
    return res.status(201).json({ ok: true, id: rows.insertId });
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
  const conn = await pool.getConnection();
  const { SendTickets } = req.body
    if (!SendTickets || !Array.isArray(SendTickets) || SendTickets.length === 0) {
      return res.status(400).json({ error: 'El campo "SendTickets" es requerido y debe ser un array no vacío.' });
    }
  if(OPC == 1){
    try {
      await conn.beginTransaction();
      console.log("Tickets a procesar en /CreateUsers:", SendTickets);
      for (const ticket of SendTickets) {
        const { usuario, email: ticketEmail, pss, id, role } = ticket;
        const userPassword = pss;

        // Validaciones
        if (!ticketEmail || !userPassword) {
          throw new Error(`Faltan datos en el ticket ${id || '(sin id)'}`);
        }
        if (userPassword.length < 8) {
          throw new Error(`Password muy corta para ${ticketEmail}`);
        }

        // Hash específico de este usuario (bcrypt + pepper + rounds)
        const password_hash = await hashPassword(userPassword);

        // Evita duplicados por email; si existe, solo actualiza Username (o quita el UPDATE si no quieres tocarlo)
        await conn.execute(
          `INSERT INTO Users (email, password_hash, password_algo, \`Username\`, UserRole, PSSFlagchange)
          VALUES (?, ?, 'bcrypt', ?, ?, 0)
          ON DUPLICATE KEY UPDATE
            \`Username\` = VALUES(\`Username\`)`,
          [ticketEmail, password_hash, usuario, role]
        );

        // Borra el request procesado
        await conn.execute('DELETE FROM Requests WHERE id = ?', [id]);
      }

      await conn.commit();
      conn.release();
      res.json({ message: 'Usuarios creados y tickets eliminados exitosamente.' });
    } catch (txErr) {
      await conn.rollback();
      conn.release();
      console.error('/CreateUsers TX:', txErr);
      res.status(500).json({ error: 'Fallo al crear usuarios (rollback aplicado)' });
    }
  } else {
    try{
      const DeletePromises = SendTickets.map(ticket => {
        const { usuario, email, id, pss } = ticket;
        console.log(`Procesando ticket ID: ${id}, Usuario: ${usuario}, Email: ${email}, Pss: ${pss}`);
        const deleteSql = `DELETE FROM Requests WHERE id = ?`;
        return pool.query(deleteSql, [id])});
    } catch (e){
      console.error('/CreateUsers OPC!=1:', e.message);
      res.status(500).json({error: e.message});
    }
    res.json({ message: 'Operación de eliminación completada exitosamente.' });
  }
});

app.get('/GetInfotypes', async (req, res) => {
  try{
    const[rows] = await pool.query(`SELECT * FROM infotypes`)
    res.json(rows);
  } catch (e){
     console.error('/Request:', e.message);
     res.status(500).json({error: e.message});
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
    console.log('Errores a cargar:', Toload);
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

app.post('/EEInsertErrors/:User', async (req, res) =>{
  const Loadedby = req.params.User;
  // console.log(req.body);
  try {
    const Toload = req.body;
    if (!Array.isArray(Toload) || Toload.length === 0) {
      return res.status(400).json({ error: 'El campo "Toload" es requerido y debe ser un array no vacío.' });
    }
    const insertPromises = Toload.map(error => {
      const { Employee_ID, Error_Message, Load_Date, Load_Hour } = error;
      console.log(`Procesando Error para: ${Employee_ID}, Error: ${Error_Message}, Fecha: ${Load_Date}, Hora: ${Load_Hour}`);
      const sql = `INSERT INTO employee_errors (ID_EE, ID_Error, Load_Date, Load_hour) VALUES (?, ?, ?, ?)`;
      return pool.query(sql, [Employee_ID, Error_Message, Load_Date, Load_Hour]);
    });
    await Promise.all(insertPromises);
    res.json({ message: 'Errores de EE insertados exitosamente.' });
    Storefile(Loadedby);
  } catch (e){
    console.error('/InsertErrors:', e.message);
    res.status(500).json({error: e.message});
  }
});

app.post('/UpdatePSS', async (req, res) => {
  const Toprocess = Array.isArray(req.body) ? req.body : req.body?.Toprocess;
  console.log(Toprocess);
  if (!Toprocess || !Array.isArray(Toprocess) || Toprocess.length === 0) {
    return res.status(400).json({ error: 'El cuerpo debe incluir "Toprocess" como un array no vacío.' });
  }
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    for (const row of Toprocess) {
      const { id, pss } = row;
      const idNum = Number(id);
      if (!idNum || Number.isNaN(idNum) || idNum <= 0) {
        throw new Error(`ID inválido en uno de los registros: ${JSON.stringify(row)}`);
      }
      const password_hash = await hashPassword(pss);
      const [result] = await conn.execute(
        `UPDATE Users
         SET password_hash = ?, PSSFlagchange = 1, password_updated_at = NOW()
         WHERE id = ?`,
        [password_hash, idNum]
      );
    }
    console.log("Process completed successfully");
    await conn.commit();
    res.json({ message: 'Contraseñas actualizadas correctamente.' });
  } catch (err) {
    if (conn) {
      try { await conn.rollback(); } catch (e) {}
    }
    console.error('Error en /UpdatePSS:', err.message || err);
    res.status(500).json({ error: 'Fallo al actualizar contraseñas.', details: err.message });
  } finally {
    if (conn) conn.release();
  }
});

app.post("/ChangeUserRole", async (req, res) => {
  const UserData = req.body;
  console.log('Received request to /ChangeUserRole with query:', UserData);
  try{
    UserData.forEach(async (user) => {
      const { id, role } = user;
      console.log(`Updating user ID: ${id} to role: ${role}`);
      const [result] = await pool.execute(
        `UPDATE Users
         SET UserRole = ?
         WHERE id = ?`,
        [role, id]
      );
      if (result.affectedRows === 0) {
        console.warn(`User with ID ${id} not found.`);
      } else {
        console.log(`User ID ${id} updated successfully to role ${role}.`);
      }
    });
    res.json({ message: 'Roles de usuario actualizados correctamente.' });
  } catch (err) {
    console.error('Error en /ChangeUserRole:', err.message || err);
    res.status(500).json({ error: 'Fallo al actualizar los roles de usuario.', details: err.message });
  }
});

app.post('/UpdateSinglePSS', async (req, res) => {
  const { Username, NewPSS, PSSFlagchange } = req.body;
  if (!Username || !NewPSS) {
    return res.status(400).json({ error: 'Los campos "Username" y "NewPSS" son requeridos.' });
  }
  try {
    const password_hash = await hashPassword(NewPSS);
    const [result] = await pool.execute(
      `UPDATE Users
       SET password_hash = ?, PSSFlagchange = ?
       WHERE Username = ?`,
      [password_hash, PSSFlagchange, Username]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    console.error('Error en /UpdateSinglePSS:', err.message || err);
    res.status(500).json({ error: 'Fallo al actualizar la contraseña.', details: err.message });
  }
});

async function Storefile(actor) {
  console.log('Storing last load info for user:', actor);
  const now = new Date();
  const date = now.toISOString().slice(0,10);          // YYYY-MM-DD
  const hour = now.toTimeString().slice(0,8);          // HH:MM:SS
  const sql = `
  INSERT INTO LastLoad (IDinvolved, Date, Hour)
  SELECT id, CURDATE(), CURTIME()
  FROM Users
  WHERE Username = ?
  ON DUPLICATE KEY UPDATE
    Date = VALUES(Date),
    Hour = VALUES(Hour);
`;
await pool.execute(sql, [actor]);
  console.log('Log stored in DB');
}

app.get('/lastload', async (req, res) => {
  try{
    const [rows] = await pool.query(
    `SELECT 
    U.Username, 
    CONCAT (L.Date, ' ', L.Hour) AS DTALASTLOAD 
    FROM LastLoad L
    JOIN Users U ON L.IDinvolved = U.id 
    ORDER BY L.Date DESC, L.Hour DESC 
    LIMIT 1`
    );
    res.json(rows[0] ?? { Date: null, Hour: null });
  } catch (e){
      console.error('/lastload:', e.message);
      res.status(500).json({error: e.message});
  }
});



//------------------------------------------- Arranque ---------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API escuchando en ${PORT}`);
});

//------------------------------------------- Arranque ---------------------------------------------------------------------
//------------------------------------------- Pruebas ----------------------------------------------------------------------

// Body esperado: { Numentry, newFieldValue }
app.post('/TSTemployee_errors/update', async (req, res) => {
  const { Numentry, newFieldValue } = req.body;
  if (!Numentry) return res.status(400).json({ ok:false, reason: 'missing Numentry' });

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const conn = await pool.getConnection();
    try {
      // 1) leer version actual
      const [rows] = await conn.execute(
        'SELECT version FROM TSTemployee_errors WHERE Numentry = ? FOR UPDATE',
        [Numentry]
      );
      if (!rows.length) {
        conn.release();
        return res.status(404).json({ ok:false, reason: 'not_found' });
      }
      const currentVersion = rows[0].version;

      // 2) intentar update condicionando por version
      const [result] = await conn.execute(
        'UPDATE TSTemployee_errors SET ID_Error = ?, version = version + 1 WHERE Numentry = ? AND version = ?',
        [newFieldValue, Numentry, currentVersion]
      );

      if (result.affectedRows > 0) {
        // éxito
        conn.release();
        return res.status(200).json({ ok: true, attempt });
      }

      // conflicto: alguien más actualizó
      conn.release();
      // backoff exponencial antes del siguiente intento
      const backoff = 100 * Math.pow(2, attempt - 1) + Math.floor(Math.random()*50);
      await new Promise(r => setTimeout(r, backoff));
      // seguir al siguiente intento
    } catch (err) {
      conn.release();
      console.error('DB error', err);
      return res.status(500).json({ ok:false, reason: 'db_error' });
    }
  }

  // si llegamos aquí: no se logró actualizar tras retries
  return res.status(409).json({ ok:false, reason: 'conflict' });
});

//------------------------------------------- Pruebas ----------------------------------------------------------------------