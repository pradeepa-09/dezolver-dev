import { AppService } from './app.service';
import { PrismaService } from './modules/prisma/prisma.service';
export declare class AppController {
    private readonly appService;
    private readonly prisma;
    constructor(appService: AppService, prisma: PrismaService);
    getHello(): {
        message: string;
    };
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        service: string;
        uptime: number;
        database: string;
    }>;
}
