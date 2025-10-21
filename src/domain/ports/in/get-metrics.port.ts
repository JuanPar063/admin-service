import { GetMetricsDto } from '../../../infrastructure/dto/get-metrics.dto';

export interface GetMetricsPort {
  getMetrics(userId: string): Promise<GetMetricsDto>;
}