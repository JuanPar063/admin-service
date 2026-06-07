import { Logger } from '@nestjs/common';

const logger = new Logger('JwtConfig');

// Fallback SOLO para desarrollo local. En producción JWT_SECRET es obligatorio
// y debe ser el MISMO valor en todos los microservicios.
const DEV_FALLBACK_SECRET = 'dev-only-insecure-secret-change-me';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'JWT_SECRET es obligatorio en producción. Configúralo como variable de entorno.',
      );
    }
    logger.warn(
      '⚠️ JWT_SECRET no definido: usando fallback inseguro de desarrollo. NO usar en producción.',
    );
    return DEV_FALLBACK_SECRET;
  }

  return secret;
}

export function getJwtExpiration(): string {
  return process.env.JWT_EXPIRATION || '24h';
}
