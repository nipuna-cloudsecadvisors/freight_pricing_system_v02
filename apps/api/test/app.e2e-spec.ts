import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(404);
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@freight.com',
        password: 'admin123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
        expect(res.body).toHaveProperty('user');
      });
  });

  it('/rates/requests (POST) - Sea export POL defaults to Colombo', () => {
    return request(app.getHttpServer())
      .post('/rates/requests')
      .send({
        mode: 'SEA',
        type: 'FCL',
        podId: 'test-pod-id',
        equipTypeId: 'test-equip-id',
        weightTons: 10,
        detentionFreeTime: '7',
        customerId: 'test-customer-id',
        vesselRequired: false,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.polId).toBeDefined();
        // In a real test, you'd verify it's Colombo's ID
      });
  });

  it('/rates/requests (POST) - Vessel details required when vesselRequired=true', () => {
    return request(app.getHttpServer())
      .post('/rates/requests')
      .send({
        mode: 'SEA',
        type: 'FCL',
        polId: 'test-pol-id',
        podId: 'test-pod-id',
        equipTypeId: 'test-equip-id',
        weightTons: 10,
        detentionFreeTime: '7',
        customerId: 'test-customer-id',
        vesselRequired: true,
      })
      .expect(400); // Should fail without vessel details
  });

  it('/booking-requests (POST) - Cancel requires reason', () => {
    return request(app.getHttpServer())
      .post('/booking-requests/test-id/cancel')
      .send({})
      .expect(400); // Should fail without cancelReason
  });
});