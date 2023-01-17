import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SetEnvVariable } from '@Shared/decorators/set-env-variable.decorator';

export interface JwkTokenPayload {
  id: string,
}

export interface JwtTokensPair {
  accessToken: string,
  refreshToken: string,
}

@Injectable()
export class TokensService {
  @SetEnvVariable('JWT_ACCESS_SECRET', 'string', true)
  private readonly accessSecret: string;

  @SetEnvVariable('JWT_REFRESH_SECRET', 'string', true)
  private readonly refreshSecret: string;

  @SetEnvVariable('JWT_ACCESS_EXPIRES_IN', 'string', true)
  private readonly accessExpiresIn: string;

  @SetEnvVariable('JWT_REFRESH_EXPIRES_IN', 'string', true)
  private readonly refreshExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
  ) { }

  async generateAccessToken(payload: JwkTokenPayload) {
    return this.jwtService.sign(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiresIn,
    });
  }

  async generateRefreshToken(payload: JwkTokenPayload) {
    return this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    });
  }

  async generatePairTokens(payload: JwkTokenPayload): Promise<JwtTokensPair> {
    return {
      accessToken: await this.generateAccessToken(payload),
      refreshToken: await this.generateRefreshToken(payload),
    };
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.refreshSecret,
    });
  }
}
