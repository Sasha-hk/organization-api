import { ChangeBossDto, UserDto } from '@Module/user/dto/user.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Prisma from '@prisma/client';

import { prisma } from '@Shared/services/prisma.service';

/**
 * User service
 */
@Injectable()
export class UserService {
  readonly prismaService = prisma;

  /**
   * User service constructor
   *
   * @param masterScheduleService master schedule service
   * @param userPictureService user picture service
   */
  constructor() { }

  async findFirst(args: Prisma.Prisma.UserFindFirstArgs) {
    return this.prismaService.user.findFirst(args);
  }

  async findMany(args: Prisma.Prisma.UserFindManyArgs) {
    return this.prismaService.user.findMany(args);
  }

  async create(args: Prisma.Prisma.UserCreateArgs) {
    return this.prismaService.user.create(args);
  }

  async getExists<T extends Prisma.Prisma.UserFindFirstArgs>(
    data: Prisma.Prisma.SelectSubset<T, Prisma.Prisma.UserFindFirstArgs>,
    callback?: () => never,
  ) {
    // Check if user exists
    const candidate = await this.prismaService.user.findFirst(data);

    if (!candidate) {
      if (!callback) {
        throw new NotFoundException('User not exists');
      }

      callback();
    }

    return candidate;
  }

  async getSubordinates(user: any) {
    const boss = await this.prismaService.user.findFirst({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        bossId: true,
        createdAt: true,
        updatedAt: true,
        subordinates: true,
      },
    });

    for (let i = 0; i < boss.subordinates.length; i++) {
      boss.subordinates[i] = await this.getSubordinates(boss.subordinates[i]);
    }

    return boss as any;
  }

  async getUser(userId: string) {
    const candidate = await this.getExists({
      where: {
        id: userId,
      },
    });

    if (candidate.role === 'administrator') {
      return await this.prismaService.user.findMany({});
    } else if (candidate.role === 'boss') {
      const boss = await this.prismaService.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          bossId: true,
          createdAt: true,
          updatedAt: true,
          subordinates: true,
        },
      });

      for (let i = 0; i < boss.subordinates.length; i++) {
        boss.subordinates[i] = await this.getSubordinates(boss.subordinates[i]);
      }

      return boss;
    }

    return candidate;
  }

  async changesBoss(
    userId: string,
    body: ChangeBossDto,
  ) {
    const currentBossCandidate = await this.getExists({
      where: {
        id: userId,
      },
    });

    const subordinateCandidate = await this.getExists({
      where: {
        id: body.subordinateId,
      },
    });

    const newBossCandidate = await this.getExists({
      where: {
        id: body.newBossId,
      },
    });

    if (subordinateCandidate.bossId !== currentBossCandidate.id)  {
      throw new BadRequestException('Impossible to change the user\'s boss');
    }

    await this.prismaService.user.update({
      data: {
        bossId: newBossCandidate.id,
      },
      where: {
        id: body.subordinateId,
      },
    });

    await this.prismaService.user.update({
      data: {
        role: 'boss',
      },
      where: {
        id: body.newBossId,
      },
    });
  }
}
