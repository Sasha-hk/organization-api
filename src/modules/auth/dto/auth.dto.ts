import Prisma from '@prisma/client';
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

interface SignInDtoI extends
  Partial<Pick<Prisma.User, 'email' | 'username'>>,
  Pick<Prisma.User, 'password'> { }

export class SignInDto implements SignInDtoI {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(64)
  readonly password: string;
}

export class SignUpDto implements Pick<
  Prisma.User,
  'email' |
  'username' |
  'password'
> {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(15)
  readonly username: string;

  @IsString()
  @MinLength(4)
  @MaxLength(64)
  readonly password: string;
}
