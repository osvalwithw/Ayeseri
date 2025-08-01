
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3327;

// Middleware
app.use(cors()); // Permite peticiones desde cualquier origen
app.use(express.json()); // Para manejar JSON en peticiones POST

// Conexión a la base de datos
const db = mysql.createConnection({
  host: '192.168.18.254',
  user: 'apicon',
  password: '!G00gl3!',
  database: 'dev_base'
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
    process.exit(1);
  }
  console.log('Conectado a la base de datos MySQL');
});

// Ruta para obtener todos los registros de la tabla errors
app.get('/errors', (req, res) => {
  db.query('SELECT * FROM errors', (err, results) => {
    if (err) {
      console.error('❌ Error en la consulta /errors:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/employee_errors/:id', (req, res) => {
  const id = req.params.id;
  const query = `
    SELECT 
      ee.ID_EE, 
      ee.Load_Date, 
      ee.Load_hour, 
      e.Error_message,
      IT.ID_Infotype
    FROM employee_errors ee
    JOIN errors e ON ee.ID_Error = e.IDX
    JOIN infotypes IT ON e.ID_Infotype = IT.Infotype_IND
    WHERE ee.ID_EE = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error en la consulta por ID_EE:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontró ningún registro con ese ID_EE' });
    }

    res.json(results); // o `res.json(results)` si esperas múltiples
  });
});


// Escuchar en el puerto 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API corriendo en http://0.0.0.0:${PORT}`);
});