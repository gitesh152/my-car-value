import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const dummyPassword = process.env.DUMMY_PASSWORD!;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  interface AuthResponse {
    id: number;
    email: string;
  }

  it('handles a signup request', () => {
    const email = 'test@email.com';
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: dummyPassword })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body as AuthResponse;
        expect(id).toBeDefined();
        expect(email).toEqual(email);
      });
  });

  it('signup as a new user then get the currently logged in user', async () => {
    const email = `dummyuser2@email.com`;
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: dummyPassword })
      .expect(201);

    const cookie = res.headers['set-cookie'];
    expect(cookie).toBeDefined();

    const response = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    const body = response.body as AuthResponse;
    expect(body.email).toBe(email);
  });
});
