import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly cls;
    constructor(cls: ClsService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
