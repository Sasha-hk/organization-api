import { Module } from '@nestjs/common';

import { UserController } from '@Src/modules/user/user.controller';
import { UserService } from '@Src/modules/user/user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [],
  exports: [UserService],
})
export class UserModule { }
