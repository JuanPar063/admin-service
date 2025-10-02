import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../../domain/entities/report.entity';

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

  async getReports(filters: { type?: string; from?: string; to?: string }) {
    const where: any = {};
    if (filters.type) where.type = filters.type;
    return this.reportRepository.find({ where });
  }
}
