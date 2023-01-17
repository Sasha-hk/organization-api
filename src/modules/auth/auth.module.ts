import { forwardRef, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from '@Src/modules/auth/auth.controller';
import { AuthService } from '@Src/modules/auth/auth.service';
import { JwtStrategy } from '@Src/modules/auth/jwt.strategy';
import { LocalStrategy } from '@Src/modules/auth/local.strategy';
import { SessionService } from '@Src/modules/auth/session.service';
import { TokensService } from '@Src/modules/auth/tokens.service';
import { UserModule } from '@Src/modules/user/user.module';

@Module({
  controllers: [AuthController],
  providers: [
    LocalStrategy, JwtStrategy,
    JwtService, TokensService,
    AuthService, SessionService,
  ],
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
  ],
  exports: [
    LocalStrategy, JwtStrategy,
    JwtService, TokensService,
    AuthService, SessionService,
  ],
})
export class AuthModule { };
