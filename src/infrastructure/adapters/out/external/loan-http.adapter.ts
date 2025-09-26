import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoanExternalPort } from '../../../../../domain/ports/out/loan-external.port';

@Injectable()
export class LoanHttpAdapter implements LoanExternalPort {
  constructor(private readonly httpService: HttpService) {}

  async getLoansByUser (userId: string): Promise<{ totalLoans: number; pendingLoans: number }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://${process.env.LOAN_SERVICE_URL || 'localhost:3002'}/loans/balance/${userId}`),
      );
      return response.data; // Asume { totalLoans, pendingLoans }
    } catch (error) {
      return { totalLoans: 0, pendingLoans: 0 }; // Fallback
    }
  }
}