/* eslint-disable max-len */
import { ChangeBossDto } from '@Module/user/dto/user.dto';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProtectedRequest } from '@Src/modules/auth/interface/protected-request.interface';
import { JwtAuthGuard } from '@Src/modules/auth/jwt-auth.guard';
import { UserService } from '@Src/modules/user/user.service';

/**
 * User controller
 */
@ApiTags('User')
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
    return await this.userService.getUser({ id: req.user.id });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('')
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
