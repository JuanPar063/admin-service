import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ExternalUserService {
  constructor(private readonly httpService: HttpService) {}

  async getAdminProfiles(): Promise<any[]> {
    // Cambia la URL por la del microservicio destino
    const response$ = this.httpService.get('http://localhost:4000/profiles?role=admin');
    const response = await lastValueFrom(response$);
    return response.data;
  }
}