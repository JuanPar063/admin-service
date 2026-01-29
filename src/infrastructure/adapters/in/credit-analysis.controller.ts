import { Controller, Get, Param } from '@nestjs/common';
import { CreditAnalysisService } from '../../../application/services/credit-analysis.service';
import { ProfileClient } from './ProfileClientHTTP';

@Controller('credit-analysis')
export class CreditAnalysisController {
  constructor(
    private readonly creditAnalysisService: CreditAnalysisService,
    private readonly profileClient: ProfileClient,
  ) {}

  /**
   * ✅ Devuelve el análisis crediticio de TODOS los clientes
   */
  @Get()
  async getAll() {
    const profiles = await this.profileClient.getAllProfiles();

    // Nota: si tienes MUCHOS clientes, conviene paginar o limitar concurrencia.
    const results = await Promise.all(
      profiles.map(async (p) => {
        const analysis = await this.creditAnalysisService.analyzeClient(p.id_user);
        return { profile: p, analysis };
      }),
    );

    return { message: 'Credit analyses retrieved successfully', data: results };
  }

  /**
   * ✅ Buscar por documento: devuelve el análisis de un cliente específico
   */
  @Get('document/:documentNumber')
  async getByDocument(@Param('documentNumber') documentNumber: string) {
    const profile = await this.profileClient.getProfileByDocument(documentNumber);
    const analysis = await this.creditAnalysisService.analyzeClient(profile.id_user);
    return { message: 'Credit analysis retrieved successfully', data: { profile, analysis } };
  }

  /**
   * (opcional) mantener el endpoint por id si ya lo usas en otros lados
   */
  @Get(':clientId')
  async getByClientId(@Param('clientId') clientId: string) {
    const analysis = await this.creditAnalysisService.analyzeClient(clientId);
    return { message: 'Credit analysis retrieved successfully', data: analysis };
  }
}