const express = require('express');
const path = require('path');
const pool = require('./config/db');

const app = express();
app.use(express.json());

// ── Archivos estáticos del frontend ────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Inicializar la tabla si no existe ─────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS equipos (
      id               SERIAL PRIMARY KEY,
      nombre           VARCHAR(50) NOT NULL UNIQUE,
      puntos           INT DEFAULT 0,
      diferencia_goles INT DEFAULT 0
    );
  `);
  console.log('✅ Tabla equipos lista');
}

// ── Endpoint de Salud para Render (Health Check) ───────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'UP', database: 'CONNECTED' });
  } catch (error) {
    res.status(500).json({ status: 'DOWN', error: error.message });
  }
});

// ── GET /api/posiciones — Tabla de posiciones ──────────────────────────────
app.get('/api/posiciones', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM equipos ORDER BY puntos DESC, diferencia_goles DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la tabla de posiciones' });
  }
});

// ── POST /api/equipos — Agregar un equipo ─────────────────────────────────
app.post('/api/equipos', async (req, res) => {
  const { nombre, puntos = 0, diferencia_goles = 0 } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre del equipo es obligatorio' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO equipos (nombre, puntos, diferencia_goles) VALUES ($1, $2, $3) RETURNING *',
      [nombre.trim(), Number(puntos), Number(diferencia_goles)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un equipo con ese nombre' });
    }
    res.status(500).json({ error: 'Error al agregar el equipo' });
  }
});

// ── DELETE /api/equipos/:id — Eliminar un equipo ──────────────────────────
app.delete('/api/equipos/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM equipos WHERE id = $1 RETURNING *',
      [parseInt(id)]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.json({ message: 'Equipo eliminado correctamente', equipo: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el equipo' });
  }
});

// ── Fallback SPA — Express 5 requiere la sintaxis /{*path} ────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Arranque del servidor ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  initDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ Error al inicializar la DB:', err);
      process.exit(1);
    });
}

module.exports = app;
