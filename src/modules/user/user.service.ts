import { ChangeBossDto, UserDto } from '@Module/user/dto/user.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Prisma from '@prisma/client';

import { prisma } from '@Shared/services/prisma.service';
import { useContainer } from 'class-validator';

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

  async getUser({ id, username }: Partial<
    Pick<Prisma.User, 'id' | 'username'>
  >) {
    const profile = await this.findFirst({
      where: {
        OR: [
          {
            username: {
              equals: username,
              mode: 'insensitive',
            },
          },
          {
            id,
          },
        ],
      },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return new UserDto(profile);
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

  async getUsers(userId: string) {
    const candidate = await this.getExists({
      where: {
        id: userId,
      },
    });

    if (candidate.role === 'administrator') {
      return await this.prismaService.user.findMany({});
    } else if (candidate.role === 'boss') {
      return await this.prismaService.user.findMany({
        where: {
          id: userId,
        },
      })
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

    if (subordinateCandidate.bossId !== currentBossCandidate.id)  {
      throw new BadRequestException('Impossible to change the user\'s boss');
    }

    await this.prismaService.user.update({
      data: {
        bossId: currentBossCandidate.id,
      },
      where: {
        id: subordinateCandidate.id,
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
