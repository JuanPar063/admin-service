# ==============================
# DOCKERFILE for admin-service
# ==============================

# ===================================
# STAGE 1: Development
# ===================================
FROM node:20-alpine AS development

WORKDIR /usr/src/app

# Copiar package files
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies)
RUN npm ci

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando por defecto para desarrollo
CMD ["npm", "run", "start:dev"]

# ===================================
# STAGE 2: Build (para producción)
# ===================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Build del proyecto
RUN npm run build

# ===================================
# STAGE 3: Production
# ===================================
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copiar solo lo necesario del builder
COPY --from=builder /usr/src/app/dist ./dist
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Ejecutar la aplicación compilada
CMD ["node", "dist/main.js"]