const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./config/db');
const verificarSesion = require('./middleware/auth');
require('dotenv').config();

const app = express();


// ==========================================
// CONFIGURACIÓN DE CORS
// ==========================================
app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500'
  ],
  credentials: true
}));


// ==========================================
// MIDDLEWARES GENERALES
// ==========================================
app.use(express.json());

app.use(express.static('../'));


// ==========================================
// CONFIGURACIÓN DE SESIONES
// ==========================================
app.use(session({
  secret: process.env.SESSION_SECRET || 'clave_temporal',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60
  }
}));


// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================
const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);


// ==========================================
// RUTAS DE MASCOTAS
// PROTEGIDAS POR MIDDLEWARE
// ==========================================
const mascotasRoutes = require('./routes/mascotas');

app.use('/api/mascotas', verificarSesion, mascotasRoutes);


// ==========================================
// RUTA DE PRUEBA DE SERVIDOR Y BD
// ==========================================
app.get('/api/health', async (req, res) => {

  try {

    const [rows] = await db.query(
      'SELECT 1 + 1 AS resultado'
    );

    res.json({
      status: 'ok',
      mensaje: 'Servidor y BD funcionando',
      dbTest: rows[0].resultado
    });

  } catch (error) {

    res.status(500).json({
      status: 'error',
      mensaje: 'Error al conectar a la BD',
      error: error.message
    });

  }

});


// ==========================================
// INICIAR SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Servidor escuchando en http://localhost:${PORT}`
  );

});