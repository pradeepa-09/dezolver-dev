import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
export declare class PlansService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createPlanDto: CreatePlanDto, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    }>;
    findAll(): Promise<({
        _count: {
            subscriptions: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            subscriptions: number;
        };
        subscriptions: ({
            college: {
                id: string;
                name: string;
                domain: string | null;
                status: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            collegeId: string;
            status: string;
            planId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    }>;
    update(id: string, updatePlanDto: UpdatePlanDto, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    }>;
}
