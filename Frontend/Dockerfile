# Etapa 1: Construir la app de React
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir los archivos estáticos con un servidor liviano
FROM nginx:alpine

# Copiar la build generada por Vite a la carpeta pública de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto del servidor web
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
