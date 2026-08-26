import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class SubscriptionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createSubscriptionDto: CreateSubscriptionDto, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        collegeId: string;
        status: string;
        planId: string;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        collegeId: string;
        college: {
            id: string;
            name: string;
            domain: string | null;
            status: string;
        };
        plan: {
            id: string;
            name: string;
        };
        status: string;
        planId: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        collegeId: string;
        college: {
            id: string;
            name: string;
            domain: string | null;
            status: string;
        };
        plan: {
            id: string;
            name: string;
            description: string | null;
        };
        status: string;
        planId: string;
    }>;
    update(id: string, updateDto: UpdateSubscriptionDto, actorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        collegeId: string;
        status: string;
        planId: string;
    }>;
}
