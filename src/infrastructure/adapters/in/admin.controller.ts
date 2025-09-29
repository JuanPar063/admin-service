import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MetricsService } from '../../../application/services/metrics.service';
import { AuditLogService } from '../../../application/services/audit-log.service';
import { ReportService } from '../../../application/services/report.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly auditLogService: AuditLogService,
    private readonly reportService: ReportService,
  ) {}

  @Get('metrics/:userId')
  async getMetrics(@Param('userId') userId: string) {
    return this.metricsService.getMetrics(userId);
  }

  @Get('metrics')
  async getAllMetrics() {
    return this.metricsService.findAll();
}

  @Get('audit-logs')
  async getAllAuditLogs() {
    return this.auditLogService.findAll();
  }

  @Post('audit-logs')
  async createAuditLog(@Body() body: any) {
    return this.auditLogService.createLog(body);
  }

  @Get('reports')
  async getAllReports() {
    return this.reportService.findAll();
  }

  @Post('reports')
  async createReport(@Body() body: any) {
    return this.reportService.createReport(body);
  }
}