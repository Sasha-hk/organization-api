import { Module } from '@nestjs/common';

import { AuthModule } from '@Src/modules/auth/auth.module';
import { UserModule } from '@Src/modules/user/user.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
  ],
})
export class AppModule { }
