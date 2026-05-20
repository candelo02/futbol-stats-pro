const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

beforeAll(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS equipos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL,
      puntos INT DEFAULT 0,
      diferencia_goles INT DEFAULT 0
    );
  `);
  await pool.query(
    "INSERT INTO equipos (nombre, puntos, diferencia_goles) VALUES ('ITP F.C.', 9, 5) ON CONFLICT DO NOTHING;"
  );
});

afterAll(async () => {
  await pool.query('DROP TABLE IF EXISTS equipos;');
  await pool.end();
});

describe('GET /api/health', () => {
  it('Debería retornar status UP cuando la DB está conectada', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('UP');
  });
});

describe('GET /api/posiciones', () => {
  it('Debería retornar la lista de equipos ordenada por puntos', async () => {
    // ✅ CORRECCIÓN ERROR 2: Eliminado el bloque que lanzaba error si NODE_ENV !== 'test'.
    // La variable NODE_ENV=test la inyecta el workflow de CI (ci.yml).
    // El guard ya no es necesario aquí porque el entorno correcto se garantiza en el pipeline.

    const res = await request(app).get('/api/posiciones');
    // ✅ CORRECCIÓN ERROR 7: Typo en la aserción: .colose(200) no existe en Jest.
    // Corregido a .toEqual(200) que es el método correcto.
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].nombre).toBe('ITP F.C.');
  });
});
