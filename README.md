# ⚽ FutbolStats Pro

API REST + Frontend para gestión de tablas de posiciones de fútbol.  
Construida con **Node.js 24 + Express + PostgreSQL**, contenerizada con **Docker**, CI en **GitHub Actions** y desplegada en **Render**.

---

## 🏗️ Arquitectura

![Arquitectura de Despliegue](./arquitectura.svg)

> **Flujo:** Máquina local → GitHub (push) → GitHub Actions CI → Render Web Service + Render PostgreSQL

---

## 🐛 Los 7 Errores Críticos Corregidos

| # | Archivo | Error original | Corrección |
|---|---------|---------------|------------|
| 1 | `src/config/db.js` | Fallback de `DATABASE_URL` apuntaba a `localhost` dentro de Docker | Fallback solo para dev local; Docker y Render inyectan la URL correcta |
| 2 | `tests/app.test.js` + `ci.yml` | Guard `if (NODE_ENV !== 'test') throw` bloqueaba los tests; CI no inyectaba la variable | Guard eliminado; `ci.yml` inyecta `NODE_ENV=test` y `DATABASE_URL` |
| 3 | `Dockerfile` | Imagen base `node:14` (obsoleta, EOL) | Cambiada a `node:24-slim` |
| 4 | `Dockerfile` | `EXPOSE` con puerto incorrecto (4000) | Corregido a `EXPOSE 3000` |
| 5 | `docker-compose.yml` | `DATABASE_URL` usaba `localhost` en vez del nombre del servicio | Cambiado a `db_futbol:5432` |
| 6 | `docker-compose.yml` | Volumen mapeado a `/data/db` (ruta de MongoDB) | Corregido a `/var/lib/postgresql/data` |
| 7 | `tests/app.test.js` | Typo `.colose(200)` no existe en Jest | Corregido a `.toEqual(200)` |

---

## 🚀 Inicio rápido

### Prerrequisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Node.js 24+ (solo para tests locales sin Docker)

### Levantar con Docker Compose

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/futbol-stats-pro.git
cd futbol-stats-pro

# Levantar toda la arquitectura (backend + postgres)
docker-compose up --build

# Frontend:  http://localhost:3000
# Health:    http://localhost:3000/api/health
# Tabla:     http://localhost:3000/api/posiciones
```

### Ejecutar tests localmente

```bash
cp .env.example .env
npm install
npm test
```

---

## 📡 Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Estado de la API y conexión a DB |
| `GET` | `/api/posiciones` | Tabla ordenada por puntos |
| `POST` | `/api/equipos` | Agregar un equipo |
| `DELETE` | `/api/equipos/:id` | Eliminar un equipo |

### POST `/api/equipos` — Body

```json
{ "nombre": "Atlético Dev", "puntos": 6, "diferencia_goles": 3 }
```

---

## 🔄 CI/CD Pipeline

`.github/workflows/ci.yml` automatiza:

1. Checkout en `ubuntu-latest`
2. Levanta **PostgreSQL 15** como servicio temporal
3. Setup **Node.js 24** con caché npm
4. `npm ci` — instalación limpia
5. `npm test` — suite Jest + Supertest

El despliegue a Render se activa cuando el pipeline pasa (`autoDeploy: true`).

---

## ☁️ Despliegue en Render

`render.yaml` (Blueprint) define:

- **Web Service** `futbol-stats-pro` — `npm ci` + `npm start`
- **PostgreSQL** gestionado `futbol-stats-db` — `DATABASE_URL` inyectada automáticamente
- `healthCheckPath: /api/health`
- `autoDeploy: true`

### Pasos

1. Conectar el repo en [render.com](https://render.com)
2. Seleccionar **"Blueprint"** → apuntar a `render.yaml`
3. Render crea Web Service + PostgreSQL automáticamente
4. Verificar: `https://TU-URL.onrender.com/api/health`

---

## 📁 Estructura

```
futbol-stats-pro/
├── .github/workflows/ci.yml   # Pipeline GitHub Actions
├── public/index.html          # Frontend (tabla de posiciones)
├── src/
│   ├── app.js                 # Express — todos los endpoints + static
│   └── config/db.js           # Pool de conexión PostgreSQL
├── tests/app.test.js          # Suite Jest + Supertest
├── .env.example
├── arquitectura.svg           # Diagrama de despliegue
├── docker-compose.yml
├── Dockerfile
├── package.json
└── render.yaml                # Blueprint Render
```

---

## 🛠️ Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno | `development` / `test` / `production` |
| `DATABASE_URL` | URI PostgreSQL | `postgresql://user:pass@host:5432/db` |

---

*Node.js 24 · PostgreSQL 15 · Docker · GitHub Actions · Render*
