import { Metrics } from '../../entities/metrics.entity';

export interface GetMetricsPort {
  getMetrics(userId: string): Promise<Metrics>;
}