const express = require('express');
const session = require('express-session');
const db = require('./config/db');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'clave_temporal',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}));


app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS resultado');
    res.json({ status: 'ok', mensaje: 'Servidor y BD funcionando', dbTest: rows[0].resultado });
  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: 'Error al conectar a la BD', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});