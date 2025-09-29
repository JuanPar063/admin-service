import { Controller, Get, Param /*, UseGuards*/ } from '@nestjs/common';
import { MetricsService } from '../../../application/services/metrics.service';
import { Roles } from '../../decorators/roles.decorator'; // Custom decorator para @Roles('admin')
// import { JwtAuthGuard } from '../../guards/jwt-auth.guard'; // Asume guard para role 'admin'

import { 
  ApiTags, 
  ApiOperation, 
  ApiParam, 
  ApiResponse, 
  ApiBearerAuth 
} from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth() // Documenta que el endpoint usa auth tipo Bearer (JWT)
@Controller('admin')
export class AdminController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('metrics/:userId')
  // @UseGuards(JwtAuthGuard) // descomenta en prod
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener métricas de un usuario por ID (solo admin)' })
  @ApiParam({ name: 'userId', type: String, example: '12345', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Métricas obtenidas correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido (solo rol admin)' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getMetrics(@Param('userId') userId: string) {
    return this.metricsService.getMetrics(userId);
  }
}
