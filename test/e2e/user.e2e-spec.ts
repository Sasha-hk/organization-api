/* eslint-disable max-len */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';

import { AppModule } from '@Src/app.module';
import { clearDatabase } from '@Test/util/clear-database';
import { Application } from 'express';
import getCookies from '@Test/util/get-cookies';

describe('UserController (e2e)', () => {
  let app: Application;
  let application: INestApplication;

  const administrator = {
    email: 'admin@email.com',
    username: 'bigBoss',
    password: '12345678',
    role: 'administrator',
    refreshToken: '',
    accessToken: '',
  };

  const user1 = {
    email: 'user1@email.com',
    username: 'Josh',
    password: '12345678',
    refreshToken: '',
    accessToken: '',
  };

  const user2 = {
    email: 'user2@email.com',
    username: 'James',
    password: '12345678',
    refreshToken: '',
    accessToken: '',
  };

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
          password: '12345678',
          role: 'administrator',
        },
      });
    }

    const r = await request(app)
      .post('/auth/sign-in')
      .send({
        email: 'admin@email.com',
        username: 'bigBoss',
        password: '12345678',
        role: 'administrator',
      })
      .expect(400);
    console.log(r.body);

    expect(r.body.accessToken).toBeTruthy();

    const cookies = getCookies(r);
    expect(cookies.refreshToken.value).toBeTruthy();

    administrator.refreshToken = cookies.refreshToken.value;
    administrator.accessToken = r.body.accessToken;

    await request(app)
      .post('/auth/sign-up')
      .send(user1)
      .expect(200);

    const { body: responseUser1 } = await request(app)
      .post('/auth/sign-in')
      .send(user1)
      .expect(200);

    const cookies1 = getCookies(responseUser1);

    user1.refreshToken = cookies1.refreshToken.value;
    user1.accessToken = r.body.accessToken;

    await request(app)
      .post('/auth/sign-up')
      .send(user2)
      .expect(200);

    const { body: responseUser2 } = await request(app)
      .post('/auth/sign-in')
      .send(user2)
      .expect(200);

    const cookies2 = getCookies(responseUser2);

    user2.refreshToken = cookies2.refreshToken.value;
    user2.accessToken = r.body.accessToken;
  });

  afterAll(async () => {
    await application.close();
    await clearDatabase();
  });


  describe('get user actions', () => {
    test('get regular user', async () => {

    });

    test('get boss user', async () => {

    });

    test('get admin user', async () => {

    });
  });

  describe('change subordinates actions', () => {
    test('set boss for user', async () => {

    });

    test('changes boss for user', async () => {

    });

    test('delete boss for user', async () => {

    });
  });
});
