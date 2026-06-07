import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import CircuitBreaker from 'opossum';

export interface Profile {
  id_user: string;
  first_name?: string;
  last_name?: string;
  name?: string;  // ✅ Nombre completo
  document_type?: string;
  document_number?: string;
  documentNumber?: string; // Alias para compatibilidad
  phone?: string;
  address?: string;
  monthly_income?: number; // ✅ Ingreso mensual
  created_at?: string;
  updated_at?: string;
}

type WrappedResponse<T> = { message?: string; data: T } | T;

@Injectable()
export class ProfileClient {
  private readonly logger = new Logger(ProfileClient.name);
  private readonly baseUrl =
    (process.env.USER_SERVICE_URL?.replace(/\/$/, '') ?? 'http://user-service:3000') +
    '/api/v1';
  private readonly getProfileBreaker: CircuitBreaker<[string], Profile>;

  constructor(private readonly http: HttpService) {
    // Reintentos automáticos ante errores de red o 5xx.
    // El HttpService es singleton y se comparte con LoanClient, así que el guard
    // evita registrar los interceptores de reintento más de una vez.
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

    // Circuit breaker hacia user-service para getProfile.
    this.getProfileBreaker = new CircuitBreaker(
      (userId: string) => this.fetchProfile(userId),
      {
        timeout: parseInt(process.env.PROFILE_TIMEOUT_MS || '5000', 10),
        errorThresholdPercentage: 50,
        resetTimeout: parseInt(process.env.PROFILE_RESET_MS || '10000', 10),
        errorFilter: (err: any) => err?.response?.status === 404,
      },
    );
    this.getProfileBreaker.on('open', () =>
      this.logger.error('🔴 Circuit breaker ABIERTO hacia user-service'),
    );
  }

  private async fetchProfile(userId: string): Promise<Profile> {
    const res = await firstValueFrom(
      this.http.get<WrappedResponse<Profile>>(`${this.baseUrl}/profiles/${userId}`),
    );
    return this.normalizeProfile(this.unwrap(res.data));
  }

  private unwrap<T>(payload: WrappedResponse<T>): T {
    return (payload as any)?.data ?? (payload as T);
  }

  /**
   * Normaliza el perfil para asegurar campos consistentes
   */
  private normalizeProfile(profile: Profile): Profile {
    return {
      ...profile,
      name: profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
      documentNumber: profile.document_number || profile.documentNumber,
      monthly_income: Number(profile.monthly_income) || 0,
    };
  }

  async getProfile(userId: string): Promise<Profile> {
    try {
      return await this.getProfileBreaker.fire(userId);
    } catch (error) {
      this.logError('getProfile', error);
      throw error;
    }
  }

  async getAllProfiles(): Promise<Profile[]> {
    try {
      this.logger.log(`Fetching all profiles from ${this.baseUrl}/profiles`);
      const res = await firstValueFrom(
        this.http.get<WrappedResponse<Profile[]>>(`${this.baseUrl}/profiles`),
      );
      const profiles = this.unwrap(res.data);
      this.logger.log(`Fetched ${profiles.length} profiles`);
      return profiles.map((p) => this.normalizeProfile(p));
    } catch (error) {
      this.logError('getAllProfiles', error);
      throw error;
    }
  }

  async getProfileByDocument(documentNumber: string): Promise<Profile> {
    try {
      const res = await firstValueFrom(
        this.http.get<WrappedResponse<Profile>>(
          `${this.baseUrl}/profiles/document/${encodeURIComponent(documentNumber)}`,
        ),
      );
      return this.normalizeProfile(this.unwrap(res.data));
    } catch (error) {
      this.logError('getProfileByDocument', error);
      throw error;
    }
  }

  private logError(method: string, error: unknown) {
    if (error instanceof AxiosError) {
      this.logger.error(
        `${method} failed: ${error.message} - Status: ${error.response?.status} - URL: ${error.config?.url}`,
      );
    } else {
      this.logger.error(`${method} failed:`, error);
    }
  }
}