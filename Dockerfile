# ❌ ERROR 3 (OPTIMIZACIÓN): Está usando una versión antigua y pesada en lugar de node:22-slim o node:24-slim.
FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# ❌ ERROR 4 (PUERTOS): Expone el puerto 8080 cuando el código de la app busca el 3000 o process.env.PORT.
EXPOSE 8080

CMD ["npm", "start"]