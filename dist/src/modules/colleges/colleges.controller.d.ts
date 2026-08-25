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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            domain: string | null;
            status: string;
        };
        financeUser: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            collegeId: string | null;
        };
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        domain: string | null;
        status: string;
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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        domain: string | null;
        status: string;
    }>;
    update(id: string, updateCollegeDto: UpdateCollegeDto, req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        domain: string | null;
        status: string;
    }>;
    suspend(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        domain: string | null;
        status: string;
    }>;
    reactivate(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        domain: string | null;
        status: string;
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
