import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';
export declare class CollegesService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    create(createCollegeDto: CreateCollegeDto, actorId: string): Promise<{
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
            mfaEnabled: boolean;
            mfaSecret: string | null;
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
    update(id: string, updateCollegeDto: UpdateCollegeDto, actorId: string): Promise<{
        id: string;
        name: string;
        domain: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    suspend(id: string, actorId: string): Promise<{
        id: string;
        name: string;
        domain: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    reactivate(id: string, actorId: string): Promise<{
        id: string;
        name: string;
        domain: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    impersonate(id: string, superAdminId: string): Promise<{
        accessToken: string;
        financeUser: {
            id: string;
            email: string;
        };
    }>;
    impersonateStop(actorUser: {
        isImpersonation?: boolean;
        impersonatorId?: string;
        id?: string;
        targetCollegeId?: string;
    }): Promise<{
        success: boolean;
    }>;
}
