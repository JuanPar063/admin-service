import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../../domain/entities/report.entity';
import { ReportDto } from '../../infrastructure/dto/report.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async createReport(data: Partial<Report>): Promise<Report> {
    const report = this.reportRepository.create(data);
    return this.reportRepository.save(report);
  }

  async findAll(): Promise<Report[]> {
    return this.reportRepository.find();
  }

  async getReports(filters: { period?: string }): Promise<ReportDto[]> {
  const where: any = {};
  if (filters.period) where.period = filters.period;
  const reports = await this.reportRepository.find({ where });
  return reports.map(report => ({
    id: report.id,
    period: report.period,
    totalClientsHighRisk: report.total_clients_high_risk,
    averageCreditScore: report.average_credit_score,
    totalPendingLoans: report.total_pending_loans,
    generatedAt: report.generated_at,
  }));
}
}
