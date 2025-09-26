import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MetricsService } from '../../../../application/services/metrics.service';
import { GetMetricsPort } from '../../../../domain/ports/in/get-metrics.port';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard'; // Asume guard para role 'admin'
import { Roles } from '../../../decorators/roles.decorator'; // Custom decorator para @Roles('admin')

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('metrics/:userId')
  @Roles('admin')
  async getMetrics(@Param('userId') userId: string): Promise<any> {
    const metrics = await (this.metricsService as GetMetricsPort).getMetrics(userId);
    return metrics;
  }
}