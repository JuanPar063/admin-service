import { Controller, Get, Param, Query, Post, Body, UseGuards, Req } from '@nestjs/common';
import { MetricsService } from '../../../application/services/metrics.service';
import { AuditLogService } from '../../../application/services/audit-log.service';
import { Roles } from '../../decorators/roles.decorator';
import { ReportService } from '../../../application/services/report.service';
import { GetMetricsDto } from '../../dto/get-metrics.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ExternalUserService } from '../../../application/services/external-user.service'; // Nuevo import

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
    private readonly auditLogService: AuditLogService,
    private readonly reportService: ReportService,
    private readonly externalUserService: ExternalUserService, // Nuevo servicio
  ) {}

  @Get('profiles')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar perfiles de administradores' })
  async getAdminProfiles(): Promise<any[]> {
    return this.externalUserService.getAdminProfiles();
  }

  // MÉTRICAS
  @Get('metrics')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener todas las métricas' })
  @ApiOkResponse({
    description: 'Lista de métricas',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: { type: 'string', example: '12345' },
          loansCount: { type: 'number', example: 17 },
          totalAmount: { type: 'number', example: 890000 },
          lastActivityAt: { type: 'string', format: 'date-time', example: '2025-09-01T12:34:56.000Z' },
        },
      },
    },
  })
  async getAllMetrics(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.metricsService.getAllMetrics(page, limit);
  }

  @Get('metrics/me')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener métricas del usuario autenticado' })
  @ApiOkResponse({
    description: 'Métricas del usuario autenticado',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '12345' },
        loansCount: { type: 'number', example: 5 },
        totalAmount: { type: 'number', example: 250000 },
        lastActivityAt: { type: 'string', format: 'date-time', example: '2025-09-20T15:45:00.000Z' },
      },
    },
  })
  async getMyMetrics(@Req() req): Promise<GetMetricsDto> {
    const userId = req.user.id_user; // Extraído del JWT
    return this.metricsService.getMetrics(userId);
  }

  @Get('metrics/:userId')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener métricas de un usuario' })
  @ApiParam({ name: 'userId', type: String, example: '12345' })
  @ApiOkResponse({
    description: 'Métricas del usuario',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '12345' },
        loansCount: { type: 'number', example: 5 },
        totalAmount: { type: 'number', example: 250000 },
        lastActivityAt: { type: 'string', format: 'date-time', example: '2025-09-20T15:45:00.000Z' },
      },
    },
  })
  async getMetrics(@Param('userId') userId: string): Promise<GetMetricsDto> {
    return this.metricsService.getMetrics(userId);
  }

  // AUDIT LOGS
  @Get('audit-logs')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar audit logs' })
  @ApiOkResponse({
    description: 'Lista de audit logs',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'log_001' },
          userId: { type: 'string', example: '12345' },
          action: { type: 'string', example: 'CREATE_LOAN' },
          entity: { type: 'string', example: 'loan' },
          entityId: { type: 'string', example: 'loan_abc_001' },
          metadata: { type: 'object', example: { amount: 500000, currency: 'COP' } },
          createdAt: { type: 'string', format: 'date-time', example: '2025-09-22T10:15:00.000Z' },
        },
      },
    },
  })
  async getAuditLogs(@Query('from') from?: string, @Query('to') to?: string, @Query('userId') userId?: string) {
    return this.auditLogService.getAuditLogs({ from, to, userId });
  }

  @Post('audit-logs')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear un audit log' })
  @ApiCreatedResponse({
    description: 'Audit log creado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'log_003' },
        userId: { type: 'string', example: '12345' },
        action: { type: 'string', example: 'DELETE_LOAN' },
        entity: { type: 'string', example: 'loan' },
        entityId: { type: 'string', example: 'loan_abc_002' },
        metadata: { type: 'object', example: { reason: 'user_request' } },
        createdAt: { type: 'string', format: 'date-time', example: '2025-09-29T09:00:00.000Z' },
      },
    },
  })
  async createAuditLog(@Body() body: any) {
    return { success: true };
  }

  // REPORTES
  @Get('reports')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar reportes generados' })
  @ApiOkResponse({
    description: 'Listado de reportes',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'rep_001' },
          type: { type: 'string', example: 'loans-by-day' },
          generatedAt: { type: 'string', format: 'date-time', example: '2025-09-25T08:00:00.000Z' },
          rows: { type: 'number', example: 250 },
          url: { type: 'string', example: 'https://files.example.com/reports/rep_001.csv' },
        },
      },
    },
  })
  async getReports(@Query('period') period?: string) {
    return this.reportService.getReports({ period });
  }

  @Post('reports')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generar un reporte' })
  @ApiCreatedResponse({
    description: 'Reporte generado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'rep_002' },
        type: { type: 'string', example: 'portfolio-status' },
        generatedAt: { type: 'string', format: 'date-time', example: '2025-09-29T10:00:00.000Z' },
        rows: { type: 'number', example: 120 },
        url: { type: 'string', example: 'https://files.example.com/reports/rep_002.csv' },
      },
    },
  })
  async createReport(@Body() body: any) {
    return { success: true };
  }
}

