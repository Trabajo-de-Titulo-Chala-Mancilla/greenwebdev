# La imagen incluye Chromium: su versión debe coincidir con la de playwright en package-lock.json.
FROM mcr.microsoft.com/playwright:v1.65.0-noble AS base
WORKDIR /app
COPY package*.json ./

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runtime
ENV NODE_ENV=production
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# Chromium abre sitios de terceros: nunca se ejecuta como root.
USER pwuser
EXPOSE 3000
CMD ["node", "dist/server.js"]
