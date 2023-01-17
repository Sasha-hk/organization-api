import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import Prisma from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

import { SetEnvVariable } from '@Shared/decorators/set-env-variable.decorator';
import { SignUpDto } from '@Src/modules/auth/dto/auth.dto';
import { SessionService } from '@Src/modules/auth/session.service';
import { TokensService } from '@Src/modules/auth/tokens.service';
import { UserService } from '@Src/modules/user/user.service';

@Injectable()
export class AuthService {
  @SetEnvVariable('PASSWORD_SALT', 'number')
  private readonly passwordSalt: number;

  constructor(
    private readonly userService: UserService,
    private readonly tokensService: TokensService,
    private readonly sessionService: SessionService,
  ) { }

  async signUp(
    {
      email,
      username,
      password,
    }: SignUpDto,
  ) {
    const emailOrUsernameExists = await this.userService.findMany({
      where: {
        OR: [
          {
            email,
          },
          {
            username,
          },
        ],
      },
    });

    if (emailOrUsernameExists.length !== 0) {
      for (let i = 0; i < emailOrUsernameExists.length; i++) {
        if (emailOrUsernameExists[i].username === username) {
          throw new BadRequestException('Email already exists');
        } else if (emailOrUsernameExists[i].email === email) {
          throw new BadRequestException('Username already exists');
        }
      }
    }

    const hashedPassword = bcryptjs.hashSync(password, this.passwordSalt);

    const admin = await this.userService.getExists({
      where: {
        role: 'administrator',
      },
    });

    await this.userService.create({
      data: {
        email: email.toLowerCase(),
        username,
        role: 'regular',
        password: hashedPassword,
        bossId: admin.id,
      },
    });
  }

  async singIn(user: Prisma.User) {
    const tokens = await this.tokensService.generatePairTokens(
      { id: user.id },
    );

    await this.sessionService.create({
      userId: user.id,
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  async logOut(
    {
      userId,
      refreshToken,
    }: Pick<Prisma.AuthSession, 'userId' | 'refreshToken'>,
  ) {
    const candidate = await this.sessionService.findFirst({
      where: {
        userId,
        refreshToken,
      },
    });

    if (candidate) {
      await this.sessionService.delete({
        where: {
          id: candidate.id,
        },
      });
    }
  }

  async refresh({ refreshToken }: Pick<Prisma.AuthSession, 'refreshToken'>) {
    if (!refreshToken) {
      throw new BadRequestException('No refresh token');
    }

    if (refreshToken.split('.').length !== 3) {
      throw new UnauthorizedException('Bad refresh token');
    }

    let validToken;

    try {
      validToken = this.tokensService.verifyRefreshToken(refreshToken);
    } catch (e: any) {
      throw new UnauthorizedException('Bad refresh token');
    }

    const candidate = await this.sessionService.findFirst({
      where: {
        userId: validToken.id,
        refreshToken,
      },
    });

    if (!candidate) {
      throw new BadRequestException('Refresh token not exists');
    }

    const tokens = await this.tokensService.generatePairTokens(
      { id: validToken.id },
    );

    await this.sessionService.update(
      candidate.id, { refreshToken: tokens.refreshToken },
    );

    return tokens;
  }

  async validateUser(username: string, inputPassword: string) {
    const candidate = await this.userService.findFirst({
      where: {
        username,
      },
    });

    if (!candidate) {
      return 'User not exists';
    }

    if (!bcryptjs.compareSync(inputPassword, candidate.password)) {
      return 'Bad password';
    }

    return candidate;
  }
}
