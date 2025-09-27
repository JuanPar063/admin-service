import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { MetricsService } from './application/services/metrics.service';
import { AdminController } from './infrastructure/adapters/in/admin.controller';
import { LoanHttpAdapter } from './infrastructure/adapters/out/external/loan-http.adapter';
import { UserHttpAdapter } from './infrastructure/adapters/out/external/user-http.adapter';

@Module({
  imports: [
    HttpModule,
    JwtModule.register({ secret: process.env.JWT_SECRET || 'secret' }), // Para validar JWT
  ],
  providers: [
    MetricsService,
    {
      provide: 'LoanExternalPort',
      useClass: LoanHttpAdapter,
    },
    {
      provide: 'UserExternalPort',
      useClass: UserHttpAdapter,
    },
  ],
  controllers: [AdminController],
})
export class AppModule {}