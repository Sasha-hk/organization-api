import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { Application } from 'express';
import * as jwt from 'jsonwebtoken';
import * as request from 'supertest';

import { prisma } from '@Shared/services/prisma.service';
import { AppModule } from '@Src/app.module';
import { clearDatabase } from '@Test/util/clear-database';
import getCookies from '@Test/util/get-cookies';
import { sleep } from '@Test/util/sleep';

describe('AuthController (e2e)', () => {
  let app: Application;
  let application: INestApplication;

  beforeAll(async () => {
    // Init express application
    const module: TestingModule = await Test
      .createTestingModule({
        imports: [AppModule],
      })
      .compile();

    application = await module
      .createNestApplication()
      .use(cookieParser())
      .useGlobalPipes(new ValidationPipe({ transform: true }))
      .init();

    app = application.getHttpServer();

    await clearDatabase();

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
  });

  afterAll(async () => {
    await application.close();
    await clearDatabase();
  });

  const user = {
    username: 'regular',
    email: 'regular@example.com',
    password: 'regular',
    refreshToken: '',
    accessToken: '',
  };

  test('POST sign-up', async () => {
    await request(app)
      .post('/auth/sign-up')
      .send(user)
      .expect(201);

    const users = await prisma.user.findMany({});
    expect(users.length).toBe(2);
  });

  test('POST sign-in', async () => {
    const r = await request(app)
      .post('/auth/sign-in')
      .send(user)
      .expect(200);

    expect(r.body.accessToken).toBeTruthy();

    const cookies = getCookies(r);
    expect(cookies.refreshToken.value).toBeTruthy();

    user.refreshToken = cookies.refreshToken.value;
    user.accessToken = r.body.accessToken;

    const authSession = await prisma.authSession.findMany();
    expect(authSession.length).toBe(1);
    expect(cookies.refreshToken.value).toBe(authSession[0].refreshToken);

    const decodedRefreshToken = jwt.decode(user.refreshToken);

    if (typeof decodedRefreshToken === 'object') {
      expect(decodedRefreshToken.id).toBe(authSession[0].userId);
    } else {
      throw new Error('Expect token to be an object');
    }

    const decodedAccessToken = jwt.decode(user.refreshToken);

    if (typeof decodedAccessToken === 'object') {
      expect(decodedAccessToken.id).toBe(authSession[0].userId);
    } else {
      throw new Error('Expect token to be an object');
    }
  });

  test('GET refresh', async () => {
    await sleep(1000);
    const r = await request(app)
      .get('/auth/refresh')
      .set('Cookie', [`refreshToken=${user.refreshToken}`])
      .set({ Authorization: 'Bearer ' + user.accessToken })
      .expect(200);

    expect(r.body.accessToken).toBeTruthy();

    const sessions = await prisma.authSession.findMany();

    expect(sessions.length).toBe(1);
    expect(sessions[0].refreshToken).not.toBe(user.refreshToken);

    const cookies = getCookies(r);

    user.accessToken = r.body.accessToken;
    user.refreshToken = cookies.refreshToken.value;
  });

  test('GET log-out', async () => {
    // Sign-in
    const signInResponse = await request(app)
      .post('/auth/sign-in')
      .send(user)
      .expect(200);

    const signInCookies = getCookies(signInResponse);

    user.accessToken = signInResponse.body.accessToken;
    user.refreshToken = signInCookies.refreshToken.value;

    // Log-out
    const r = await request(app)
      .get('/auth/log-out')
      .set('Cookie', [`refreshToken=${user.refreshToken}`])
      .set({ Authorization: 'Bearer ' + user.accessToken })
      .expect(200);

    const cookies = getCookies(r);

    expect(cookies.refreshToken.value).toBe('');
  });
});
