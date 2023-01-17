import Prisma from '@prisma/client';
import { Exclude } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class UserDto {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  pictureId: string;
  clientProfileId: string;
  masterProfileId: string;
  phoneNumber: string;
  banned: boolean;
  role: Prisma.Role;
  masterProfile: any;
  clientProfile: any;
  createdAt: Date;
  updatedAt: Date;

  @Exclude() password: string;

  constructor(data: Prisma.User) {
    Object.assign(this, data);
  }
}

export class ChangeBossDto {
  @IsUUID()
  readonly subordinateId: string;

  @IsUUID()
  readonly newBossId: string;
}
