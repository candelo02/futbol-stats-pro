# ✅ CORRECCIÓN ERROR 3: Imagen moderna y ligera node:24-slim en lugar de node:14 (obsoleta y pesada)
FROM node:24-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

# ✅ CORRECCIÓN ERROR 4: Puerto corregido a 3000, consistente con la app y docker-compose
EXPOSE 3000

CMD ["npm", "start"]
