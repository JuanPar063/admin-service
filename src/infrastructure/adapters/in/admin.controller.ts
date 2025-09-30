import { Controller, Get, Post, Body, Param /*, UseGuards*/ } from '@nestjs/common';
import { MetricsService } from '../../../application/services/metrics.service';
import { AuditLogService } from '../../../application/services/audit-log.service';
import { ReportService } from '../../../application/services/report.service';
import { Roles } from '../../decorators/roles.decorator';
// import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly auditLogService: AuditLogService,
    private readonly reportService: ReportService,
  ) {}

  @Get('metrics/:userId')
  // @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener métricas de un usuario' })
  @ApiParam({ name: 'userId', type: String })
  @ApiResponse({ status: 200, description: 'Métricas encontradas' })
  async getMetrics(@Param('userId') userId: string) {
    return this.metricsService.getMetrics(userId);
  }

  @Get('metrics')
  // @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener todas las métricas' })
  @ApiResponse({ status: 200, description: 'Lista de métricas' })
  async getAllMetrics() {
    return this.metricsService.findAll();
  }

  @Get('audit-logs')
  // @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener todos los logs de auditoría' })
  @ApiResponse({ status: 200, description: 'Lista de logs de auditoría' })
  async getAllAuditLogs() {
    return this.auditLogService.findAll();
  }

  @Post('audit-logs')
  // @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Crear un log de auditoría' })
  @ApiResponse({ status: 201, description: 'Log creado' })
  async createAuditLog(@Body() body: any) {
    return this.auditLogService.createLog(body);
  }

  @Get('reports')
  // @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener todos los reportes' })
  @ApiResponse({ status: 200, description: 'Lista de reportes' })
  async getAllReports() {
    return this.reportService.findAll();
  }

  @Post('reports')
  // @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Crear un reporte' })
  @ApiResponse({ status: 201, description: 'Reporte creado' })
  async createReport(@Body() body: any) {
    return this.reportService.createReport(body);
  }
}