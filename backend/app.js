require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const db = require('./config/db');
const verificarSesion = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const mascotasRoutes = require('./routes/mascotas');
const citasRoutes = require('./routes/citas');
const serviciosRoutes = require('./routes/servicios');

const app = express();

app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  credentials: true
}));

app.use(express.json());

// Ruta absoluta hacia la raíz del proyecto para los archivos estáticos (HTML/CSS/JS del frontend)
app.use(express.static(path.join(__dirname, '..')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'clave_temporal',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/mascotas', verificarSesion, mascotasRoutes);
app.use('/api/citas', verificarSesion, citasRoutes);
app.use('/api/servicios', verificarSesion, serviciosRoutes);

// Endpoint de prueba de conexión
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS resultado');
    res.json({ status: 'ok', mensaje: 'Servidor y BD funcionando', dbTest: rows[0].resultado });
  } catch (error) {
    res.status(500).json({ status: 'error', mensaje: 'Error al conectar a la BD', error: error.message });
  }
});

module.exports = app;