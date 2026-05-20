const { Pool } = require('pg');
require('dotenv').config();

// ✅ CORRECCIÓN ERROR 1: El fallback usa 'localhost' solo para desarrollo local directo.
// En Docker, la variable DATABASE_URL siempre apunta a 'db_futbol' (nombre del servicio).
// En Render, la variable DATABASE_URL la inyecta automáticamente el Blueprint.
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password123@localhost:5432/futbol_db';

const pool = new Pool({
  connectionString,
  // Para Render con SSL habilitado en el managed DB:
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('⚡ Conexión exitosa a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de Postgres', err);
});

module.exports = pool;
