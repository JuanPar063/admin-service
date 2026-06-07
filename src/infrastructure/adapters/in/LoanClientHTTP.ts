import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axiosRetry from 'axios-retry';

export interface Payment {
  id?: string;
  loan_id?: string;
  amount?: number;
  date: string;     // ISO
  dueDate: string;  // ISO
  payment_date?: string;
  status?: string;
}

export interface Loan {
  id?: string;
  user_id?: string;
  amount?: number;
  approved_amount?: number;
  interest_rate?: number;
  term_months?: number;
  status?: string;
  remainingBalance: number;
  installmentValue?: number;
  payments: Payment[];
  created_at?: string;
  updated_at?: string;
}

type WrappedResponse<T> = { message?: string; data: T } | T;

@Injectable()
export class LoanClient {
  private readonly logger = new Logger(LoanClient.name);
  private readonly LOAN_SERVICE_URL =
    (process.env.LOAN_SERVICE_URL?.replace(/\/$/, '') ?? 'http://loan-service:3001') +
    '/api/v1';

  constructor(private readonly http: HttpService) {
    // Reintentos automáticos ante errores de red o 5xx hacia loan-service.
    // Guard de idempotencia: el HttpService es singleton y compartido con ProfileClient.
    const axiosRef = this.http.axiosRef as any;
    if (!axiosRef.__retryConfigured) {
      axiosRetry(this.http.axiosRef, {
        retries: 3,
        retryDelay: axiosRetry.exponentialDelay,
        retryCondition: (error) =>
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status ?? 0) >= 500,
      });
      axiosRef.__retryConfigured = true;
    }
  }

  /**
   * Extrae data de respuestas envueltas en { message, data }
   */
  private unwrap<T>(response: WrappedResponse<T>): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: T }).data;
    }
    return response as T;
  }

  async getUserLoans(userId: string): Promise<Loan[]> {
    try {
      const url = `${this.LOAN_SERVICE_URL}/loans/user/${userId}`;
      this.logger.log(`Fetching loans from ${url}`);

      const { data } = await firstValueFrom(
        this.http.get<WrappedResponse<Loan[]>>(url),
      );

      const loans = this.unwrap(data);
      
      // Asegurarse de que es un array
      if (!Array.isArray(loans)) {
        this.logger.warn(`Expected array but got: ${typeof loans}`);
        return [];
      }

      this.logger.log(`Fetched ${loans.length} loans for user ${userId}`);
      return loans;
    } catch (error) {
      this.logger.error(`Error fetching loans for user ${userId}:`, error.message);
      return [];
    }
  }
}