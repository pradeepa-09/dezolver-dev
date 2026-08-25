import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CollegesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createCollegeDto: CreateCollegeDto, actorId: string) {
    // Check uniqueness
    if (createCollegeDto.domain) {
      const existing = await this.prisma.college.findUnique({
        where: { domain: createCollegeDto.domain },
      });
      if (existing) {
        throw new ConflictException('College domain already in use');
      }
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create College
      const college = await tx.college.create({
        data: {
          name: createCollegeDto.name,
          domain: createCollegeDto.domain,
          status: 'ACTIVE',
        },
      });

      // 2. Create Finance Team login (ADMIN)
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

      // 3. Emit Audit Log
      await tx.auditLog.create({
        data: {
          action: 'COLLEGE_CREATED',
          actorId,
          targetId: college.id,
          targetType: 'College',
          metadata: { financeUserId: financeUser.id },
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  async findOne(id: string) {
    const college = await this.prisma.college.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, email: true, role: true, isActive: true },
        },
      },
    });
    if (!college) {
      throw new NotFoundException('College not found');
    }
    return college;
  }

  async update(
    id: string,
    updateCollegeDto: UpdateCollegeDto,
    actorId: string,
  ) {
    const college = await this.prisma.college.findUnique({ where: { id } });
    if (!college) {
      throw new NotFoundException('College not found');
    }

    if (updateCollegeDto.domain && updateCollegeDto.domain !== college.domain) {
      const existing = await this.prisma.college.findUnique({
        where: { domain: updateCollegeDto.domain },
      });
      if (existing) {
        throw new ConflictException('College domain already in use');
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
        metadata: updateCollegeDto as Prisma.InputJsonValue,
      },
    });

    return updatedCollege;
  }

  async suspend(id: string, actorId: string) {
    const college = await this.prisma.college.findUnique({ where: { id } });
    if (!college) {
      throw new NotFoundException('College not found');
    }

    if (college.status === 'SUSPENDED') {
      throw new BadRequestException('College is already suspended');
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

  async reactivate(id: string, actorId: string) {
    const college = await this.prisma.college.findUnique({ where: { id } });
    if (!college) {
      throw new NotFoundException('College not found');
    }

    if (college.status === 'ACTIVE') {
      throw new BadRequestException('College is already active');
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

  async impersonate(id: string, superAdminId: string) {
    const college = await this.prisma.college.findUnique({ where: { id } });
    if (!college) {
      throw new NotFoundException('College not found');
    }

    const financeAdmin = await this.prisma.user.findFirst({
      where: { collegeId: id, role: 'ADMIN', isActive: true },
    });

    if (!financeAdmin) {
      throw new NotFoundException(
        'No active Finance Team account found for this college',
      );
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

  async impersonateStop(actorUser: {
    isImpersonation?: boolean;
    impersonatorId?: string;
    id?: string;
    targetCollegeId?: string;
  }) {
    if (!actorUser.isImpersonation || !actorUser.impersonatorId) {
      throw new UnauthorizedException('Not an active impersonation session');
    }

    await this.prisma.auditLog.create({
      data: {
        action: 'IMPERSONATION_ENDED',
        actorId: actorUser.impersonatorId,
        targetId: actorUser.id,
        targetType: 'User',
        metadata: { targetCollegeId: actorUser.targetCollegeId },
      },
    });

    return { success: true };
  }
}
