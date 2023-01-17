/* eslint-disable max-len */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcryptjs from 'bcryptjs';
import * as cookieParser from 'cookie-parser';
import * as util from 'util';

import { AppModule } from '@Src/app.module';
import { clearDatabase } from '@Test/util/clear-database';
import { UserActions } from '@Test/util/user-actions';
import { Application } from 'express';

describe('UserController (e2e)', () => {
  let app: Application;
  let application: INestApplication;

  let admin: UserActions;
  let user1: UserActions;
  let user2: UserActions;
  let user3: UserActions;
  let user4: UserActions;

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

    admin = new UserActions(app, {
      email: 'admin@email.com',
      username: 'bigBoss',
      password: '12345678',
    })
    user1 = new UserActions(app);
    user2 = new UserActions(app);
    user3 = new UserActions(app);
    user4 = new UserActions(app);

    const adminCandidate = await prisma.user.findFirst({
      where: {
        role: 'administrator',
      },
    });

    if (!adminCandidate) {
      await prisma.user.create({
        data: {
          email: admin.email,
          username: admin.username,
          password: bcryptjs.hashSync(admin.password, 3),
          role: 'administrator',
        },
      });
    }

    await admin.logIn();
    await user1.register();
    await user2.register();
    await user3.register();
    await user4.register();
  });

  afterAll(async () => {
    await application.close();
    await clearDatabase();
  });

  test('set boss for user', async () => {
    await admin.request({
      url: '/user/boss',
      method: 'patch',
      send: {
        subordinateId: user2.user.id,
        newBossId: user1.user.id,
      },
    });

    await admin.request({
      url: '/user/boss',
      method: 'patch',
      send: {
        subordinateId: user3.user.id,
        newBossId: user2.user.id,
      },
    });

    await admin.request({
      url: '/user/boss',
      method: 'patch',
      send: {
        subordinateId: user4.user.id,
        newBossId: user2.user.id,
      },
    });

    const { body: newBoss } = await user1.getUser();

    expect(newBoss.role).toBe('boss');

    const { body: newSubordinate } = await user2.getUser();

    expect(newSubordinate.role).toBe('boss');
    expect(newSubordinate.bossId).toBe(user1.user.id);
  });

  test('get regular user', async () => {
    const { body } = await user3.getUser();

    expect(body.role).toBe('regular');
    expect(body.subordinates).toBeUndefined();
  })

  test('get boss user', async () => {
    const { body } = await user1.getUser();

    console.log(util.inspect(body, { depth: null, colors: true }));
  })

  test('get admin user', async () => {
    const { body } = await admin.getUser();

    expect(body).toHaveLength(5);
  })
});
