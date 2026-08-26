"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollegesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let CollegesService = class CollegesService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async create(createCollegeDto, actorId) {
        if (createCollegeDto.domain) {
            const existing = await this.prisma.college.findUnique({
                where: { domain: createCollegeDto.domain },
            });
            if (existing) {
                throw new common_1.ConflictException('College domain already in use');
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const college = await tx.college.create({
                data: {
                    name: createCollegeDto.name,
                    domain: createCollegeDto.domain,
                    status: 'ACTIVE',
                },
            });
            const rawPassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(rawPassword, 10);
            const financeEmail = `finance_${college.id.split('-')[0]}@${createCollegeDto.domain || 'dev.local'}`;
            const financeUser = await tx.user.create({
                data: {
                    email: financeEmail,
                    password: hashedPassword,
                    role: 'ADMIN',
                    collegeId: college.id,
                    isActive: true,
                },
            });
            await tx.auditLog.create({
                data: {
                    action: 'COLLEGE_CREATED',
                    actorId,
                    targetId: college.id,
                    targetType: 'College',
                    metadata: { financeUserId: financeUser.id },
                },
            });
            const { password, ...safeFinanceUser } = financeUser;
            return {
                college,
                financeUser: safeFinanceUser,
            };
        });
    }
    async findAll() {
        return this.prisma.college.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const college = await this.prisma.college.findUnique({
            where: { id },
            include: {
                users: {
                    select: { id: true, email: true, role: true, isActive: true },
                },
            },
        });
        if (!college) {
            throw new common_1.NotFoundException('College not found');
        }
        return college;
    }
    async update(id, updateCollegeDto, actorId) {
        const college = await this.prisma.college.findUnique({ where: { id } });
        if (!college) {
            throw new common_1.NotFoundException('College not found');
        }
        if (updateCollegeDto.domain && updateCollegeDto.domain !== college.domain) {
            const existing = await this.prisma.college.findUnique({
                where: { domain: updateCollegeDto.domain },
            });
            if (existing) {
                throw new common_1.ConflictException('College domain already in use');
            }
        }
        const updatedCollege = await this.prisma.college.update({
            where: { id },
            data: updateCollegeDto,
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'COLLEGE_UPDATED',
                actorId,
                targetId: college.id,
                targetType: 'College',
                metadata: updateCollegeDto,
            },
        });
        return updatedCollege;
    }
    async suspend(id, actorId) {
        const college = await this.prisma.college.findUnique({ where: { id } });
        if (!college) {
            throw new common_1.NotFoundException('College not found');
        }
        if (college.status === 'SUSPENDED') {
            throw new common_1.BadRequestException('College is already suspended');
        }
        const updated = await this.prisma.college.update({
            where: { id },
            data: { status: 'SUSPENDED' },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'COLLEGE_SUSPENDED',
                actorId,
                targetId: college.id,
                targetType: 'College',
            },
        });
        return updated;
    }
    async reactivate(id, actorId) {
        const college = await this.prisma.college.findUnique({ where: { id } });
        if (!college) {
            throw new common_1.NotFoundException('College not found');
        }
        if (college.status === 'ACTIVE') {
            throw new common_1.BadRequestException('College is already active');
        }
        const updated = await this.prisma.college.update({
            where: { id },
            data: { status: 'ACTIVE' },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'COLLEGE_REACTIVATED',
                actorId,
                targetId: college.id,
                targetType: 'College',
            },
        });
        return updated;
    }
    async impersonate(id, superAdminId) {
        const college = await this.prisma.college.findUnique({ where: { id } });
        if (!college) {
            throw new common_1.NotFoundException('College not found');
        }
        const financeAdmin = await this.prisma.user.findFirst({
            where: { collegeId: id, role: 'ADMIN', isActive: true },
        });
        if (!financeAdmin) {
            throw new common_1.NotFoundException('No active Finance Team account found for this college');
        }
        const payload = {
            sub: financeAdmin.id,
            role: financeAdmin.role,
            isImpersonation: true,
            impersonatorId: superAdminId,
            targetCollegeId: college.id,
        };
        const token = this.jwtService.sign(payload, { expiresIn: '1h' });
        await this.prisma.auditLog.create({
            data: {
                action: 'IMPERSONATION_STARTED',
                actorId: superAdminId,
                targetId: financeAdmin.id,
                targetType: 'User',
                metadata: { targetCollegeId: college.id },
            },
        });
        return {
            accessToken: token,
            financeUser: { id: financeAdmin.id, email: financeAdmin.email },
        };
    }
    async impersonateStop(actorUser) {
        if (!actorUser.isImpersonation || !actorUser.impersonatorId) {
            throw new common_1.UnauthorizedException('Not an active impersonation session');
        }
        await this.prisma.auditLog.create({
            data: {
                action: 'IMPERSONATION_ENDED',
                actorId: actorUser.id,
                targetId: actorUser.id,
                targetType: 'User',
                metadata: {
                    targetCollegeId: actorUser.targetCollegeId,
                    impersonatorId: actorUser.impersonatorId,
                },
            },
        });
        return { success: true };
    }
};
exports.CollegesService = CollegesService;
exports.CollegesService = CollegesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], CollegesService);
//# sourceMappingURL=colleges.service.js.map