const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({
  path: path.join(__dirname, '..', '.env'),
  quiet: true
});

const dbName = process.env.DB_SETUP_NAME;
const protectedNames = ['vetgroup7_db', 'vetgroup7_fase4_test'];

async function main() {
  if (!dbName || !/^[a-zA-Z0-9_]+$/.test(dbName)) {
    throw new Error('Indica un DB_SETUP_NAME válido.');
  }

  if (protectedNames.includes(dbName.toLowerCase())) {
    throw new Error('No se permite instalar sobre una base de datos protegida.');
  }

  const databaseDir = path.join(__dirname, '..', '..', 'database');

  const allowedPatterns = {
    'schema.sql': /^CREATE\s+TABLE\s+(usuarios|mascotas|servicios|citas)\s*\(/i,
    'seeders.sql': /^INSERT\s+INTO\s+(usuarios|mascotas|servicios|citas)\s*(\(|VALUES\b)/i
  };

  const statementsByFile = [];

  for (const filename of ['schema.sql', 'seeders.sql']) {
    let sql = fs.readFileSync(
      path.join(databaseDir, filename),
      'utf8'
    );

    sql = sql.replace(/^\s*--[^\r\n]*/gm, '');

    sql = sql
      .replace(/\bDROP\s+DATABASE\s+IF\s+EXISTS\s+vetgroup7_db\s*;/gi, '')
      .replace(/\bCREATE\s+DATABASE\s+vetgroup7_db\s+CHARACTER\s+SET\s+utf8mb4\s+COLLATE\s+utf8mb4_unicode_ci\s*;/gi, '')
      .replace(/\bUSE\s+vetgroup7_db\s*;/gi, '');

    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      if (!allowedPatterns[filename].test(statement)) {
        throw new Error(
          `Instrucción no permitida en ${filename}: ${statement.slice(0, 80)}`
        );
      }


    }

    statementsByFile.push({ filename, statements });
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: false
  });

  try {
    const [tables] = await connection.query(
      `SELECT TABLE_NAME
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = ?`,
      [dbName]
    );

    if (tables.length > 0) {
      throw new Error(
        `La base ${dbName} ya contiene tablas. Instalación cancelada.`
      );
    }

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\`
       CHARACTER SET utf8mb4
       COLLATE utf8mb4_unicode_ci`
    );

    await connection.changeUser({ database: dbName });

    for (const { filename, statements } of statementsByFile) {
      for (const statement of statements) {
        await connection.query(statement);
      }

      console.log(`${filename}: ejecutado correctamente`);
    }

    console.log(`Instalación completada en ${dbName}.`);
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error('Instalación cancelada:', error.message);
  process.exitCode = 1;
});
