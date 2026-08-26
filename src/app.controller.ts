import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './modules/prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    let dbStatus = 'healthy';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unavailable';
      throw new ServiceUnavailableException({
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'Dezolver API',
        uptime: process.uptime(),
        database: dbStatus,
      });
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Dezolver API',
      uptime: process.uptime(),
      database: dbStatus,
    };
  }
}
