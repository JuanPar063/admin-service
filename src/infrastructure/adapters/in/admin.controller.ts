import { Controller, Get, Param /*, UseGuards*/ } from '@nestjs/common';
import { MetricsService } from '../../../application/services/metrics.service';
import { Roles } from '../../decorators/roles.decorator'; // @Roles('admin')
// import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly metricsService: MetricsService) {}

  // Todas las métricas
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
  async getAllMetrics() {
    return this.metricsService.getAllMetrics();
  }

  // Métricas por usuario
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
    return this.metricsService.getMetrics(userId);
  }
}
