const { Pool } = require('pg');
require('dotenv').config();

// ❌ ERROR 1 (INFRAESTRUCTURA): El string de conexión usa 'localhost' en lugar del nombre 
// del servicio de Docker ('db_futbol'). Esto hará que falle DENTRO del contenedor del backend.
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password123@localhost:5432/futbol_db';

const pool = new Pool({
  connectionString,
});

pool.on('connect', () => {
  console.log('⚡ Conexión exitosa a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de Postgres', err);
});

module.exports = pool;