# ============================================
# STAGE 1: Instalar dependencias de desarrollo
# ============================================
FROM node:20-alpine AS dev-dependencies

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias para build
RUN npm ci --legacy-peer-deps && \
    npm cache clean --force

# ============================================
# STAGE 2: Desarrollo
# ============================================
FROM node:20-alpine AS development

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar node_modules desde la etapa anterior
COPY --from=dev-dependencies /usr/src/app/node_modules ./node_modules

# Copiar archivos de la aplicación
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando para desarrollo con hot-reload
CMD ["npm", "run", "start:dev"]

# ============================================
# STAGE 3: Builder (para producción)
# ============================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --legacy-peer-deps --only=production && \
    npm cache clean --force

COPY . .

# Compilar la aplicación
RUN npm run build

# ============================================
# STAGE 4: Producción
# ============================================
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copiar node_modules de producción
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copiar código compilado
COPY --from=builder /usr/src/app/dist ./dist

# Exponer el puerto
EXPOSE 3000

# Usuario no root
USER node

# Comando para producción
CMD ["node", "dist/main.js"]