/* eslint-disable max-len */
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
} from '@nestjs/swagger';
import Prisma from '@prisma/client';
import { Request, Response } from 'express';

import { AuthService } from '@Src/modules/auth/auth.service';
import { ProtectedRequest } from '@Src/modules/auth/interface/protected-request.interface';
import { JwtAuthGuard } from '@Src/modules/auth/jwt-auth.guard';
import { LocalAuthGuard } from '@Src/modules/auth/local-auth.guard';
import { JwtTokensPair } from '@Src/modules/auth/tokens.service';
import { SignUpDto } from './dto/auth.dto';
import { GetCookies } from '@Shared/decorators/get-cookies.decorator';

function sendRefreshAndAccessTokens(
  res: Response,
  { refreshToken, accessToken }: JwtTokensPair,
) {
  res.cookie(
    'refreshToken',
    refreshToken,
    {
      maxAge: 30 * 24 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: true,
    },
  );

  res.status(200).json({
    accessToken,
  });
}

@ApiTags('Authentication / authorization')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('sign-up')
  async signUp(
    @Res() res: Response,
    @Body() body: SignUpDto,
  ) {
    await this.authService.signUp(body);

    res.sendStatus(201);
  }

  @UsePipes(ValidationPipe)
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signIn(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.singIn(
      req.user as Prisma.User,
    );

    sendRefreshAndAccessTokens(res, tokens);
  }

  @UseGuards(JwtAuthGuard)
  @Get('log-out')
  async logOut(
    @Req() req: ProtectedRequest,
    @Res() res: Response,
    @GetCookies('refreshToken') refreshToken: string,
  ) {
    await this.authService.logOut({ userId: req.user.id, refreshToken });

    res.clearCookie('refreshToken');

    res.sendStatus(200);
  }

  @Get('refresh')
  async refresh(
    @Res() res: Response,
    @GetCookies('refreshToken') refreshToken: string,
  ) {
    const tokens = await this.authService.refresh({ refreshToken });

    sendRefreshAndAccessTokens(res, tokens);
  }
}
