# Imagen base oficial de Node.js
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del proyecto
COPY . .

# Expone el puerto donde corre tu API
EXPOSE 3000

# Comando para ejecutar el servidor
CMD ["node", "server.js"]
