/* eslint-disable max-len */
import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ChangeBossDto } from '@Module/user/dto/user.dto';
import { ProtectedRequest } from '@Src/modules/auth/interface/protected-request.interface';
import { JwtAuthGuard } from '@Src/modules/auth/jwt-auth.guard';
import { UserService } from '@Src/modules/user/user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getUser(
    @Req() req: ProtectedRequest,
  ) {
    return await this.userService.getUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('boss')
  async changeBoss(
    @Req() req: ProtectedRequest,
    @Body() body: ChangeBossDto,
  ) {
    return await this.userService.changesBoss(
      req.user.id,
      body,
    );
  }
}
