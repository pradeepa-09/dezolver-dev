import { CollegesService } from './colleges.service';
import { CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';
export declare class CollegesController {
    private readonly collegesService;
    constructor(collegesService: CollegesService);
    create(createCollegeDto: CreateCollegeDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
        college: {
            id: string;
            name: string;
            domain: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        };
        financeUser: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
            collegeId: string | null;
        };
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        domain: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        users: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
        }[];
    } & {
        id: string;
        name: string;
        domain: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateCollegeDto: UpdateCollegeDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        name: string;
        domain: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    suspend(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        name: string;
        domain: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    reactivate(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        name: string;
        domain: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    impersonate(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
        accessToken: string;
        financeUser: {
            id: string;
            email: string;
        };
    }>;
    impersonateStop(req: {
        user: {
            isImpersonation?: boolean;
            impersonatorId?: string;
            id?: string;
            targetCollegeId?: string;
        };
    }): Promise<{
        success: boolean;
    }>;
}
