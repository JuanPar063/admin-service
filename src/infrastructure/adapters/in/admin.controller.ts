import { Controller, Get, Param, Query, Post, Body /*, UseGuards*/ } from '@nestjs/common';
import { MetricsService } from '../../../application/services/metrics.service';
import { Roles } from '../../decorators/roles.decorator';
// import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly metricsService: MetricsService,
    // Si tienes servicios separados, los inyectas aquí:
    // private readonly auditLogsService: AuditLogsService,
    // private readonly reportsService: ReportsService,
  ) {}

  // =========================
  // MÉTRICAS
  // =========================
  @Get('metrics')
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener todas las métricas' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({ description: 'Lista de métricas (schema documentado en Swagger)' })
  async getAllMetrics(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.metricsService.getAllMetrics(page, limit);
  }

  @Get('metrics/:userId')
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener métricas de un usuario' })
  @ApiParam({ name: 'userId', type: String, example: '12345' })
  @ApiOkResponse({ description: 'Métricas del usuario (schema documentado en Swagger)' })
  async getMetrics(@Param('userId') userId: string) {
    return this.metricsService.getMetrics(userId);
  }

  // =========================
  // AUDIT LOGS
  // =========================
  @Get('audit-logs')
  @Roles('admin')
  @ApiOperation({ summary: 'Listar audit logs' })
  @ApiOkResponse({ description: 'Lista de audit logs (schema documentado en Swagger)' })
  async getAuditLogs(@Query('from') from?: string, @Query('to') to?: string, @Query('userId') userId?: string) {
    // return this.auditLogsService.getAuditLogs({ from, to, userId });
  }

  @Post('audit-logs')
  @Roles('admin')
  @ApiOperation({ summary: 'Crear un audit log' })
  @ApiCreatedResponse({ description: 'Audit log creado (schema documentado en Swagger)' })
  async createAuditLog(
    @Body()
    body: {
      userId: string;
      action: string;
      entity: string;
      entityId: string;
      metadata?: Record<string, any>;
    },
  ) {
    // return this.auditLogsService.createAuditLog(body);
  }

  // =========================
  // REPORTES
  // =========================
  @Get('reports')
  @Roles('admin')
  @ApiOperation({ summary: 'Listar reportes generados' })
  @ApiOkResponse({ description: 'Listado de reportes (schema documentado en Swagger)' })
  async getReports(@Query('type') type?: string, @Query('from') from?: string, @Query('to') to?: string) {
    // return this.reportsService.getReports({ type, from, to });
  }

  @Post('reports')
  @Roles('admin')
  @ApiOperation({ summary: 'Generar un reporte' })
  @ApiCreatedResponse({ description: 'Reporte generado (schema documentado en Swagger)' })
  async createReport(
    @Body()
    body: {
      type: string;
      from?: string;
      to?: string;
      filters?: Record<string, any>;
    },
  ) {
    // return this.reportsService.createReport(body);
  }
}

