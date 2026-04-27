FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto del código
COPY . .

# Puerto que expone
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["node", "server.js"]