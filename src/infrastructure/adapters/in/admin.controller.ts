import { Controller, Get, Param, Query, Post, Body /*, UseGuards*/ } from '@nestjs/common';
import { MetricsService } from '../../../application/services/metrics.service';
import { Roles } from '../../decorators/roles.decorator'; // @Roles('admin')
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
@ApiBearerAuth() // Documenta uso de Bearer JWT en Swagger
@Controller('admin')
export class AdminController {
  constructor(private readonly metricsService: MetricsService) {}

  // =========================
  // MÉTRICAS
  // =========================

  @Get('metrics')
  // @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener todas las métricas' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
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
  async getAllMetrics(@Query('page') _page?: number, @Query('limit') _limit?: number) {
    // Si tienes paginación en el servicio, úsala aquí.
    return this.metricsService.getAllMetrics
      ? this.metricsService.getAllMetrics()
      : [
          { userId: '12345', loansCount: 17, totalAmount: 890000, lastActivityAt: new Date().toISOString() },
          { userId: '67890', loansCount: 3, totalAmount: 120000, lastActivityAt: new Date().toISOString() },
        ];
  }

  @Get('metrics/:userId')
  // @UseGuards(JwtAuthGuard)
  @Roles('admin')
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
  async getMetrics(@Param('userId') userId: string) {
    return this.metricsService.getMetrics
      ? this.metricsService.getMetrics(userId)
      : { userId, loansCount: 5, totalAmount: 250000, lastActivityAt: new Date().toISOString() };
  }

  // =========================
  // AUDIT LOGS
  // =========================

  @Get('audit-logs')
  // @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Listar audit logs' })
  @ApiQuery({ name: 'from', required: false, example: '2025-09-01T00:00:00.000Z' })
  @ApiQuery({ name: 'to', required: false, example: '2025-09-29T23:59:59.000Z' })
  @ApiQuery({ name: 'userId', required: false, example: '12345' })
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
  async getAuditLogs(
    @Query('from') _from?: string,
    @Query('to') _to?: string,
    @Query('userId') _userId?: string,
  ) {
    // Sustituye por tu servicio real si lo tienes.
    return [
      {
        id: 'log_001',
        userId: _userId ?? '12345',
        action: 'CREATE_LOAN',
        entity: 'loan',
        entityId: 'loan_abc_001',
        metadata: { amount: 500000, currency: 'COP' },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'log_002',
        userId: _userId ?? '67890',
        action: 'UPDATE_PROFILE',
        entity: 'user',
        entityId: 'user_67890',
        metadata: { field: 'phone', old: '3001112233', new: '3009990000' },
        createdAt: new Date().toISOString(),
      },
    ];
  }

  @Post('audit-logs')
  // @UseGuards(JwtAuthGuard)
  @Roles('admin')
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
    // Sustituye por tu servicio real si lo tienes.
    return { id: 'log_003', createdAt: new Date().toISOString(), ...body };
  }

  // =========================
  // REPORTES
  // =========================

  @Get('reports')
  // @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Listar reportes generados' })
  @ApiQuery({ name: 'type', required: false, example: 'loans-by-day' })
  @ApiQuery({ name: 'from', required: false, example: '2025-09-01' })
  @ApiQuery({ name: 'to', required: false, example: '2025-09-29' })
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
  async getReports(
    @Query('type') _type?: string,
    @Query('from') _from?: string,
    @Query('to') _to?: string,
  ) {
    // Sustituye por tu servicio real si lo tienes.
    return [
      {
        id: 'rep_001',
        type: _type ?? 'loans-by-day',
        generatedAt: new Date().toISOString(),
        rows: 250,
        url: 'https://files.example.com/reports/rep_001.csv',
      },
    ];
  }

  @Post('reports')
  // @UseGuards(JwtAuthGuard)
  @Roles('admin')
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
  async createReport(
    @Body()
    body: {
      type: string;
      from?: string; // YYYY-MM-DD
      to?: string; // YYYY-MM-DD
      filters?: Record<string, any>;
    },
  ) {
    // Sustituye por tu servicio real si lo tienes.
    return {
      id: 'rep_002',
      type: body.type,
      generatedAt: new Date().toISOString(),
      rows: 120,
      url: 'https://files.example.com/reports/rep_002.csv',
    };
  }
}
