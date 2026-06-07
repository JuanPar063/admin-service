import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

/**
 * Healthchecks sin @nestjs/terminus (admin-service aún no está alineado a Nest 11,
 * ver item 2.1). Implementación equivalente: liveness simple + readiness que
 * verifica la BD y las dependencias HTTP.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly userServiceUrl =
    (process.env.USER_SERVICE_URL?.replace(/\/$/, '') ?? 'http://user-service:3000') +
    '/api/v1/health/liveness';
  private readonly loanServiceUrl =
    (process.env.LOAN_SERVICE_URL?.replace(/\/$/, '') ?? 'http://loan-service:3001') +
    '/api/v1/health/liveness';

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly http: HttpService,
  ) {}

  @Get('liveness')
  @ApiOperation({ summary: 'Liveness probe (el proceso está vivo)' })
  liveness() {
    return { status: 'ok' };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Readiness probe (BD y dependencias)' })
  async readiness() {
    const checks: Record<string, 'up' | 'down'> = {};

    try {
      await this.dataSource.query('SELECT 1');
      checks.database = 'up';
    } catch {
      checks.database = 'down';
    }

    checks['user-service'] = await this.ping(this.userServiceUrl);
    checks['loan-service'] = await this.ping(this.loanServiceUrl);

    const healthy = Object.values(checks).every((s) => s === 'up');
    if (!healthy) {
      throw new ServiceUnavailableException({ status: 'error', checks });
    }
    return { status: 'ok', checks };
  }

  private async ping(url: string): Promise<'up' | 'down'> {
    try {
      await firstValueFrom(this.http.get(url, { timeout: 2000 }));
      return 'up';
    } catch {
      return 'down';
    }
  }
}
