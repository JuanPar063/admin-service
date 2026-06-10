# admin-service — Backoffice y Análisis Crediticio

Microservicio NestJS para el **panel de administración**: métricas agregadas, dashboard, auditoría,
reportes y, sobre todo, el **análisis crediticio** (score, capacidad de endeudamiento, recomendación).

- **Puerto host:** 3003 (interno 3000) · **Prefijo:** `/api/v1` · **Swagger:** http://localhost:3003/api/docs
- **BD:** PostgreSQL `admin_service_db` (puerto host 5435)
- **Auth:** `JwtAuthGuard` propio (verifica el JWT con `JWT_SECRET` compartido) + `@Roles('admin')`.
  **Todos los endpoints requieren rol `admin`.**

## Rol dentro del sistema
```
frontend(admin) ─► /admin/*, /credit-analysis/*
admin-service ─► HTTP ─► user-service (perfiles, monthly_income)
              └► HTTP ─► loan-service  (préstamos enriquecidos: /loans/user/:id)
```
**Consume** user-service y loan-service (con **axios-retry + circuit breaker**). No es consumido por otros.

## Entidades
`Metrics` (score, risk_level, pending_loans, total_loans…), `AuditLog`, `Report`.

## Endpoints (`/api/v1`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/admin/profiles` | Perfiles (proxy a user-service) |
| GET | `/admin/metrics` · `/admin/metrics/:userId` · `/admin/metrics/me` | Métricas |
| GET | `/admin/clients/:clientId/metrics` · `.../metrics/export` | Detalle por cliente |
| POST | `/admin/clients/metrics/batch` | Cálculo en lote |
| GET | `/admin/dashboard/metrics` | Dashboard (score promedio, alto riesgo, pendientes) |
| GET/POST | `/admin/audit-logs` · `/admin/reports` | Auditoría / reportes |
| GET | `/credit-analysis` · `/credit-analysis/document/:doc` | Análisis crediticio |
| GET | `/health/liveness` · `/health/readiness` | Healthchecks (readiness verifica BD + downstream) |

## Funciones básicas
- **CreditAnalysisService**: combina historial de pagos (puntualidad/mora), capacidad de
  endeudamiento (`debtRatio`, `maxRecommendedLoan` con techo del 40%) y produce
  `{ score, approved, maxAmount, risks, recommendations }`.
- Interés tratado como **mensual**, coherente con loan-service.

## Variables de entorno (ver `.env.example`)
`PORT=3000`, `NODE_ENV`, `DB_HOST/DB_PORT/DB_USER/DB_PASS/DB_NAME` (runtime),
`JWT_SECRET`, `LOAN_SERVICE_URL`, `USER_SERVICE_URL` (con `http://`), `CORS_ORIGINS`, `THROTTLE_*`.
> El CLI de migraciones (`database.config.ts`) usa `DATABASE_*` en vez de `DB_*` (esquema histórico distinto).

## ⚠️ Importante para testear
- **`synchronize: false`**: en una BD nueva, admin-service **no crea sus tablas** (`metrics`,
  `audit_logs`, `reports`) automáticamente. Hasta que existan, los endpoints que las consultan fallan.
  Solución: ejecutar migraciones / crear las tablas antes de probar el dashboard.
- El acceso requiere un **JWT con rol `admin`** (regístrate/loguéate con `role: "admin"` en user-login,
  o ajusta el rol en BD) y enviarlo como `Authorization: Bearer <token>`.

## Cómo testear
Vía `../loans-software` (así user-service y loan-service están disponibles).
```bash
npm install --legacy-peer-deps   # ver nota de versiones abajo
cp .env.example .env && npm run start:dev
npm run build && npm test
curl http://localhost:3003/api/v1/admin/dashboard/metrics -H "Authorization: Bearer <token-admin>"
```

## Notas para nuevos administradores del código
- **Está en NestJS 10** (no 11 como los demás): `@nestjs/axios` v3, `@nestjs/swagger` v8, etc.
  Por eso se instala con `--legacy-peer-deps`, los healthchecks **no** usan `@nestjs/terminus`
  (hay un `HealthController` propio que hace `SELECT 1` y ping a los downstream) y **no** hay logs pino.
  Alinear a Nest 11 es un trabajo pendiente (mejora 2.1).
- Clientes HTTP: `infrastructure/adapters/in/ProfileClientHTTP.ts` y `LoanClientHTTP.ts`
  (axios-retry + opossum, rutas `/api/v1`).
- Secreto centralizado en `infrastructure/config/jwt.config.ts`.
