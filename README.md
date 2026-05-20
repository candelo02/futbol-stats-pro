# ⚽ FutbolStats Pro

API REST para gestión de tablas de posiciones de fútbol.  
Construida con **Node.js 24 + Express + PostgreSQL**, contenerizada con **Docker**, con CI en **GitHub Actions** y desplegada en **Render**.

---

## 🏗️ Arquitectura

![Arquitectura de Despliegue](./arquitectura.png)

> **Flujo:** Máquina local → GitHub (push) → GitHub Actions CI → Render Web Service + Render PostgreSQL

---

## 🐛 Los 7 Errores Críticos Corregidos

| # | Archivo | Error original | Corrección |
|---|---------|---------------|------------|
| 1 | `src/config/db.js` | Fallback de `DATABASE_URL` apuntaba a `localhost` | Cambiado a `db_futbol` (nombre del servicio Docker) |
| 2 | `tests/app.test.js` + `ci.yml` | Guard `if (NODE_ENV !== 'test') throw` bloqueaba los tests; CI no inyectaba la variable | Eliminado el guard; `ci.yml` inyecta `NODE_ENV=test` |
| 3 | `Dockerfile` | Imagen base `node:14` (obsoleta, EOL) | Cambiada a `node:24-slim` |
| 4 | `Dockerfile` | `EXPOSE` con puerto incorrecto | Corregido a `EXPOSE 3000` |
| 5 | `docker-compose.yml` | `DATABASE_URL` usaba `localhost` en vez del nombre del servicio | Cambiado a `db_futbol:5432` |
| 6 | `docker-compose.yml` | Volumen mapeado a `/data/db` (ruta de MongoDB) | Corregido a `/var/lib/postgresql/data` |
| 7 | `tests/app.test.js` | Typo `.colose(200)` no existe en Jest | Corregido a `.toEqual(200)` |

---

## 🚀 Inicio rápido

### Prerrequisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Node.js 24+ (solo para desarrollo local sin Docker)

### Levantar con Docker Compose

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/futbol-stats-pro.git
cd futbol-stats-pro

# Levantar toda la arquitectura (backend + postgres)
docker-compose up --build

# La API estará disponible en:
# http://localhost:3000/api/health
# http://localhost:3000/api/posiciones
```

### Ejecutar tests localmente

```bash
# Requiere PostgreSQL corriendo localmente en puerto 5432
# O usar las variables del .env.example

cp .env.example .env
npm install
npm test
```

---

## 📡 Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Estado de la API y conexión a DB |
| `GET` | `/api/posiciones` | Tabla de posiciones ordenada por puntos |

### Respuesta `/api/health`
```json
{
  "status": "UP",
  "database": "CONNECTED"
}
```

### Respuesta `/api/posiciones`
```json
[
  {
    "id": 1,
    "nombre": "ITP F.C.",
    "puntos": 9,
    "diferencia_goles": 5
  }
]
```

---

## 🔄 CI/CD Pipeline

El archivo `.github/workflows/ci.yml` automatiza:

1. **Checkout** del código en `ubuntu-latest`
2. **Levanta PostgreSQL 15** como servicio temporal
3. **Setup Node.js 24** con caché de npm
4. **`npm ci`** — instalación limpia y reproducible
5. **`npm test`** — suite de Jest con supertest

> El despliegue a Render se activa automáticamente cuando el pipeline pasa en verde (`autoDeploy: true`).

---

## ☁️ Despliegue en Render

El archivo `render.yaml` (Blueprint) define:

- **Web Service** `futbol-stats-pro` — runtime Node, `npm ci` + `npm start`
- **PostgreSQL** gestionado `futbol-stats-db` — `DATABASE_URL` inyectada automáticamente
- `healthCheckPath: /api/health`
- `autoDeploy: true` — despliega solo cuando CI pasa

### Pasos para desplegar

1. Conectar el repositorio en [render.com](https://render.com)
2. Seleccionar **"Blueprint"** y apuntar a `render.yaml`
3. Render crea automáticamente el Web Service + PostgreSQL
4. Copiar la URL pública y verificar: `https://TU-URL.onrender.com/api/health`

---

## 📁 Estructura del proyecto

```
futbol-stats-pro/
├── .github/
│   └── workflows/
│       └── ci.yml          # Pipeline de GitHub Actions
├── src/
│   ├── app.js              # Servidor Express + endpoints
│   └── config/
│       └── db.js           # Pool de conexión PostgreSQL
├── tests/
│   └── app.test.js         # Suite de pruebas Jest + Supertest
├── .env.example            # Plantilla de variables de entorno
├── .gitignore
├── arquitectura.png        # Diagrama de despliegue
├── arquitectura.svg        # Fuente del diagrama
├── docker-compose.yml      # Orquestación local
├── Dockerfile              # Imagen del backend
├── package.json
└── render.yaml             # Blueprint de infraestructura Render
```

---

## 🛠️ Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno (`development`, `test`, `production`) | `production` |
| `DATABASE_URL` | URI de conexión PostgreSQL | `postgresql://user:pass@host:5432/db` |

---

## 👤 Autor

Desarrollado como proyecto individual para la asignatura **Electiva DevOps**.

---

*Node.js 24 · PostgreSQL 15 · Docker · GitHub Actions · Render*
