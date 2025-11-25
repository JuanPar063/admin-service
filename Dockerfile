# ==============================
# DOCKERFILE OPTIMIZADO - admin-service
# ==============================

# ===================================
# STAGE 1: Dependencies (se cachea)
# ===================================
FROM node:20-alpine AS dependencies

WORKDIR /usr/src/app

# Copiar SOLO archivos de dependencias
COPY package*.json ./

# Instalar dependencias (esta capa se cachea)
RUN npm ci --only=production && \
    npm cache clean --force

# ===================================
# STAGE 2: Development Dependencies
# ===================================
FROM node:20-alpine AS dev-dependencies

WORKDIR /usr/src/app

COPY package*.json ./

# Instalar TODAS las dependencias para build
RUN npm ci && \
    npm cache clean --force

# ===================================
# STAGE 3: Build
# ===================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copiar dependencias instaladas
COPY --from=dev-dependencies /usr/src/app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Build del proyecto
RUN npm run build

# ===================================
# STAGE 4: Development
# ===================================
FROM node:20-alpine AS development

WORKDIR /usr/src/app

# Copiar dependencias de desarrollo
COPY --from=dev-dependencies /usr/src/app/node_modules ./node_modules
COPY package*.json ./

# Copiar código fuente
COPY . .

ENV NODE_ENV=development
EXPOSE 3000

CMD ["npm", "run", "start:dev"]

# ===================================
# STAGE 5: Production
# ===================================
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copiar SOLO dependencias de producción
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY package*.json ./

# Copiar código compilado
COPY --from=builder /usr/src/app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER node

CMD ["node", "dist/main.js"]