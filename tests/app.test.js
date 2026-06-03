const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

// ── Setup y Teardown ────────────────────────────────────────────────────────
beforeAll(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS equipos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL UNIQUE,
      puntos INT DEFAULT 0,
      diferencia_goles INT DEFAULT 0
    );
  `);
  // Equipo semilla para pruebas de lectura
  await pool.query(
    "INSERT INTO equipos (nombre, puntos, diferencia_goles) VALUES ('ITP F.C.', 9, 5) ON CONFLICT DO NOTHING;"
  );
});

afterAll(async () => {
  await pool.query('DROP TABLE IF EXISTS equipos;');
  await pool.end();
});

// ── GET /api/health ─────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('Debería retornar status UP cuando la DB está conectada', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('UP');
  });
});

// ── GET /api/posiciones ─────────────────────────────────────────────────────
describe('GET /api/posiciones', () => {
  it('Debería retornar la lista de equipos ordenada por puntos', async () => {
    const res = await request(app).get('/api/posiciones');
    // ✅ CORRECCIÓN ERROR 7: Typo corregido — .toEqual(200) en lugar de .colose(200)
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].nombre).toBe('ITP F.C.');
  });
});

// ── POST /api/equipos ───────────────────────────────────────────────────────
describe('POST /api/equipos', () => {
  it('Debería crear un equipo nuevo y retornar 201', async () => {
    const res = await request(app)
      .post('/api/equipos')
      .send({ nombre: 'FC Test', puntos: 3, diferencia_goles: 2 });
    expect(res.statusCode).toEqual(201);
    expect(res.body.nombre).toBe('FC Test');
    expect(res.body.puntos).toBe(3);
  });

  it('Debería retornar 400 si el nombre está vacío', async () => {
    const res = await request(app)
      .post('/api/equipos')
      .send({ nombre: '' });
    expect(res.statusCode).toEqual(400);
  });
});

// ── DELETE /api/equipos/:id ─────────────────────────────────────────────────
describe('DELETE /api/equipos/:id', () => {
  it('Debería eliminar un equipo existente y retornar 200', async () => {
    // Primero creamos el equipo que vamos a borrar
    const create = await request(app)
      .post('/api/equipos')
      .send({ nombre: 'Equipo A Borrar', puntos: 0, diferencia_goles: 0 });
    expect(create.statusCode).toEqual(201);

    const id = create.body.id;
    const res = await request(app).delete(`/api/equipos/${id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Equipo eliminado correctamente');
  });

  it('Debería retornar 404 si el equipo no existe', async () => {
    const res = await request(app).delete('/api/equipos/999999');
    expect(res.statusCode).toEqual(404);
  });
});
