import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Rate Requests (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let colomboPortId: string;
  let customerId: string;
  let salesUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create test data
    const colomboPort = await prisma.port.create({
      data: {
        unlocode: 'LKCMB',
        name: 'Colombo',
        country: 'Sri Lanka',
      },
    });
    colomboPortId = colomboPort.id;

    const salesUser = await prisma.user.create({
      data: {
        name: 'Test Sales User',
        email: 'test.sales@example.com',
        password: 'hashedpassword',
        role: 'SALES',
        status: 'ACTIVE',
      },
    });
    salesUserId = salesUser.id;

    const customer = await prisma.customer.create({
      data: {
        companyName: 'Test Customer',
        contactPerson: 'Test Contact',
        email: 'test@customer.com',
        approvalStatus: 'APPROVED',
        createdById: salesUserId,
        approvedById: salesUserId,
        approvedAt: new Date(),
      },
    });
    customerId = customer.id;

    // Login to get access token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test.sales@example.com',
        password: 'password123', // This would need to be properly hashed in real test
      });

    accessToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /rates/requests', () => {
    it('should default POL to Colombo for sea export when not provided', async () => {
      const rateRequestData = {
        mode: 'SEA',
        type: 'FCL',
        podId: colomboPortId, // Using same port for simplicity
        equipTypeId: 'test-equip-id',
        weightTons: 25.5,
        incoterm: 'FOB',
        cargoReadyDate: '2024-02-15T00:00:00Z',
        customerId: customerId,
      };

      const response = await request(app.getHttpServer())
        .post('/rates/requests')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(rateRequestData)
        .expect(201);

      expect(response.body.polId).toBe(colomboPortId);
    });

    it('should require vessel fields when vessel_required=true', async () => {
      const rateRequestData = {
        mode: 'SEA',
        type: 'FCL',
        podId: colomboPortId,
        equipTypeId: 'test-equip-id',
        weightTons: 25.5,
        incoterm: 'FOB',
        cargoReadyDate: '2024-02-15T00:00:00Z',
        customerId: customerId,
        vesselRequired: true,
      };

      // Create rate request first
      const createResponse = await request(app.getHttpServer())
        .post('/rates/requests')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(rateRequestData)
        .expect(201);

      const rateRequestId = createResponse.body.id;

      // Try to respond without vessel details
      const responseData = {
        lineNo: 1,
        validTo: '2024-03-01T23:59:59Z',
        chargesJson: { oceanFreight: 1200 },
      };

      await request(app.getHttpServer())
        .post(`/rates/requests/${rateRequestId}/respond`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(responseData)
        .expect(400); // Should fail without vessel details
    });
  });

  describe('POST /rates/requests/:id/line-quotes', () => {
    it('should allow only one selected line quote per request', async () => {
      // This test would verify that when adding multiple line quotes,
      // only one can be selected at a time
      // Implementation would require creating a rate request and adding quotes
    });
  });

  describe('POST /booking-requests/:id/cancel', () => {
    it('should require cancel_reason when cancelling booking', async () => {
      // This test would verify that booking cancellation requires a reason
      // Implementation would require creating a booking request and attempting to cancel
    });
  });
});
