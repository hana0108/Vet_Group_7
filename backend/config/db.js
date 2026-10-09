const mysql = require('mysql2/promise');
const path = require('path');

// Fuerza la lectura del archivo .env local
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined, // Evita enviar cadena vacía si no existe
  database: process.env.DB_NAME || 'vetgroup7_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;