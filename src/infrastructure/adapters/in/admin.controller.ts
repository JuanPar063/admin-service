import { Controller, Get, Param, Query, Post, Body, UseGuards, Req } from '@nestjs/common';
import { MetricsService } from '../../../application/services/metrics.service';
import { AuditLogService } from '../../../application/services/audit-log.service';
import { ReportService } from '../../../application/services/report.service';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ExternalUserService } from '../../../application/services/external-user.service';
import { ClientMetricsService } from '../../../application/services/client-metrics.service'; // NUEVO IMPORT

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GetMetricsDto } from '../../dto/get-metrics.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly auditLogService: AuditLogService,
    private readonly reportService: ReportService,
    private readonly externalUserService: ExternalUserService,
    private readonly clientMetricsService: ClientMetricsService, // NUEVA INYECCIÓN
  ) {}

  @Get('profiles')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar perfiles de administradores' })
  async getAdminProfiles(): Promise<any[]> {
    return this.externalUserService.getAdminProfiles();
  }

  // ============================================================
  // MÉTRICAS - ENDPOINTS EXISTENTES
  // ============================================================

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

  // ============================================================
  // MÉTRICAS POR CLIENTE - NUEVOS ENDPOINTS (VISUALIZACIÓN)
  // ============================================================

  /**
   * Endpoint 1: Obtener métricas detalladas de un cliente
   * Flujo principal - Paso 2 a 4 del documento
   */
  @Get('clients/:clientId/metrics')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener métricas detalladas de un cliente' })
  @ApiParam({ name: 'clientId', type: String, example: 'client_12345' })
  @ApiOkResponse({
    description: 'Métricas detalladas del cliente incluyendo score crediticio y riesgo',
    schema: {
      type: 'object',
      properties: {
        clientId: { type: 'string', example: 'client_12345' },
        creditScore: { type: 'number', example: 75, description: 'Score crediticio 0-100' },
        riskLevel: { type: 'string', enum: ['low', 'medium', 'high'], example: 'low' },
        pendingLoans: { type: 'number', example: 2 },
        totalLoans: { type: 'number', example: 8 },
        calculatedAt: { type: 'string', format: 'date-time', example: '2025-09-20T12:00:00Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2025-09-25T15:30:00Z' },
      },
    },
  })
  async getClientMetrics(@Param('clientId') clientId: string) {
    return this.clientMetricsService.getClientMetrics(clientId);
  }

  /**
   * Endpoint 2: Exportar/Analizar métricas de un cliente
   * Flujo principal - Paso 5 del documento
   */
  @Get('clients/:clientId/metrics/export')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Exportar y analizar métricas de un cliente' })
  @ApiParam({ name: 'clientId', type: String, example: 'client_12345' })
  @ApiOkResponse({
    description: 'Análisis completo de métricas del cliente con recomendaciones',
    schema: {
      type: 'object',
      properties: {
        clientId: { type: 'string' },
        summary: {
          type: 'object',
          properties: {
            creditScore: { type: 'number' },
            riskLevel: { type: 'string' },
          },
        },
        analysis: {
          type: 'object',
          properties: {
            riskAssessment: { type: 'string' },
            creditWorthiness: { type: 'string' },
            recommendations: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async exportClientMetrics(@Param('clientId') clientId: string) {
    return this.clientMetricsService.exportClientMetrics(clientId);
  }

  /**
   * Endpoint 3: Obtener métricas de múltiples clientes
   * Para análisis comparativos
   */
  @Post('clients/metrics/batch')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener métricas de múltiples clientes' })
  @ApiCreatedResponse({
    description: 'Métricas de múltiples clientes',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          clientId: { type: 'string' },
          creditScore: { type: 'number' },
          riskLevel: { type: 'string' },
        },
      },
    },
  })
  async getMultipleClientsMetrics(@Body() body: { clientIds: string[] }) {
    return this.clientMetricsService.getMultipleClientsMetrics(body.clientIds);
  }

  /**
   * Endpoint 4: Dashboard de métricas del administrador
   * Muestra resumen de todos los clientes
   */
  @Get('dashboard/metrics')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Dashboard de métricas agregadas' })
  @ApiOkResponse({
    description: 'Resumen de métricas de todos los clientes',
    schema: {
      type: 'object',
      properties: {
        totalClients: { type: 'number' },
        averageCreditScore: { type: 'number' },
        highRiskClients: { type: 'number' },
        pendingLoansTotal: { type: 'number' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              clientId: { type: 'string' },
              creditScore: { type: 'number' },
              riskLevel: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getMetricsDashboard(@Query('page') page?: number, @Query('limit') limit?: number) {
    const result = await this.metricsService.getAllMetrics(page, limit);
    
    // Calcular estadísticas agregadas
    const highRiskCount = result.data.filter(m => m.risk_level === 'high').length;
    const averageScore = result.data.length > 0
      ? Math.round(result.data.reduce((sum, m) => sum + m.credit_score, 0) / result.data.length)
      : 0;
    const totalPending = result.data.reduce((sum, m) => sum + m.pending_loans, 0);

    return {
      totalClients: result.total,
      averageCreditScore: averageScore,
      highRiskClients: highRiskCount,
      pendingLoansTotal: totalPending,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
      data: result.data.map(m => ({
        clientId: m.user_id,
        creditScore: m.credit_score,
        riskLevel: m.risk_level,
        pendingLoans: m.pending_loans,
        totalLoans: m.total_loans,
        calculatedAt: m.calculated_at,
      })),
    };
  }

  // ============================================================
  // AUDIT LOGS - ENDPOINTS EXISTENTES
  // ============================================================

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

  // ============================================================
  // REPORTES - ENDPOINTS EXISTENTES
  // ============================================================

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