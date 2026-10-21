import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { Server } from 'http';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let uniqueEmail: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Generate a unique email for each test run to avoid conflicts
    uniqueEmail = `test-${Date.now()}@example.com`;
  });

  afterEach(async () => {
    await app.close();
  });

  it('/auth/register (POST)', async () => {
    interface RegisterResponse {
      id: string;
      email: string;
    }
    const response = await request(app.getHttpServer() as Server)
      .post('/auth/register')
      .send({
        email: uniqueEmail,
        password: 'password123',
        name: 'Test User',
      })
      .expect(201);

    const body = response.body as RegisterResponse;
    expect(body).toHaveProperty('id');
    expect(body.email).toBe(uniqueEmail);
  });

  it('/auth/login (POST) and /auth/me (GET)', async () => {
    // 1. Register first
    await request(app.getHttpServer() as Server)
      .post('/auth/register')
      .send({
        email: uniqueEmail,
        password: 'password123',
        name: 'Test User',
      })
      .expect(201);

    // 2. Login
    interface LoginResponse {
      accessToken: string;
    }
    interface MeResponse {
      email: string;
    }
    const loginResponse = await request(app.getHttpServer() as Server)
      .post('/auth/login')
      .send({
        email: uniqueEmail,
        password: 'password123',
      })
      .expect(200);

    const loginBody = loginResponse.body as LoginResponse;
    expect(loginBody).toHaveProperty('accessToken');
    const token = loginBody.accessToken;

    // 3. Access protected route
    const meResponse = await request(app.getHttpServer() as Server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const meBody = meResponse.body as MeResponse;
    expect(meBody.email).toBe(uniqueEmail);
  });
});
