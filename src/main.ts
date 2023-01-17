import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { AppModule } from '@Src/app.module';
import { prisma } from '@Shared/services/prisma.service';

async function start() {
  const PORT = process.env.API_PORT || 5000;
  const appOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  app.enableCors();
  app.use(cookieParser());

  const adminCandidate = await prisma.user.findFirst({
    where: {
      role: 'administrator',
    },
  });

  if (!adminCandidate) {
    await prisma.user.create({
      data: {
        email: 'admin@email.com',
        username: 'bigBoss',
        password: 'root',
        role: 'administrator',
      },
    });
  }

  await app.listen(PORT);
}

start();
