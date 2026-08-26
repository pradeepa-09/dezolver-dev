import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    create(createSubscriptionDto: CreateSubscriptionDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    update(id: string, updateSubscriptionDto: UpdateSubscriptionDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        collegeId: string;
        status: string;
        planId: string;
    }>;
}
