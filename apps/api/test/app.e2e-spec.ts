import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Freight Pricing System E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let salesUserId: string;
  let pricingUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();

    // Login as sales user to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'priya@freightco.lk',
        password: 'password123',
      })
      .expect(201);

    authToken = loginResponse.body.access_token;
    salesUserId = loginResponse.body.user.id;

    // Get pricing user ID
    const pricingUser = await prisma.user.findFirst({
      where: { email: 'saman@freightco.lk' }
    });
    pricingUserId = pricingUser!.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Critical Workflow Tests', () => {
    describe('1. Sea Export POL defaults to Colombo', () => {
      it('should default POL to Colombo when not provided for sea export', async () => {
        const customer = await prisma.customer.findFirst({
          where: { approvalStatus: 'APPROVED' }
        });
        
        const pod = await prisma.port.findFirst({
          where: { unlocode: 'DEHAM' } // Hamburg
        });
        
        const equipType = await prisma.equipmentType.findFirst({
          where: { name: '40ft Container' }
        });

        const response = await request(app.getHttpServer())
          .post('/api/rates/requests')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            mode: 'SEA',
            type: 'FCL',
            // polId: not provided - should default to Colombo
            podId: pod!.id,
            doorOrCy: 'CY',
            equipTypeId: equipType!.id,
            hsCode: '0902.30',
            weightTons: 15.5,
            incoterm: 'FOB',
            cargoReadyDate: '2024-02-15',
            vesselRequired: false,
            detentionFreeTime: 'FOURTEEN',
            customerId: customer!.id,
          })
          .expect(201);

        // Verify POL was set to Colombo
        const rateRequest = await prisma.rateRequest.findUnique({
          where: { id: response.body.id },
          include: { pol: true }
        });

        expect(rateRequest!.pol.unlocode).toBe('LKCMB'); // Colombo
      });
    });

    describe('2. Vessel required validation', () => {
      it('should require vessel details when vesselRequired is true', async () => {
        // First create a rate request with vessel required
        const customer = await prisma.customer.findFirst({
          where: { approvalStatus: 'APPROVED' }
        });
        
        const pol = await prisma.port.findFirst({
          where: { unlocode: 'LKCMB' }
        });
        
        const pod = await prisma.port.findFirst({
          where: { unlocode: 'DEHAM' }
        });
        
        const equipType = await prisma.equipmentType.findFirst({
          where: { name: '40ft Container' }
        });

        const rateRequestResponse = await request(app.getHttpServer())
          .post('/api/rates/requests')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            mode: 'SEA',
            type: 'FCL',
            polId: pol!.id,
            podId: pod!.id,
            doorOrCy: 'CY',
            equipTypeId: equipType!.id,
            hsCode: '0902.30',
            weightTons: 15.5,
            incoterm: 'FOB',
            cargoReadyDate: '2024-02-15',
            vesselRequired: true, // Vessel details required
            detentionFreeTime: 'FOURTEEN',
            customerId: customer!.id,
          })
          .expect(201);

        const rateRequestId = rateRequestResponse.body.id;

        // Login as pricing user
        const pricingLoginResponse = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: 'saman@freightco.lk',
            password: 'password123',
          })
          .expect(201);

        const pricingToken = pricingLoginResponse.body.access_token;

        const shippingLine = await prisma.shippingLine.findFirst({
          where: { code: 'MSC' }
        });

        // Try to respond without vessel details - should fail
        await request(app.getHttpServer())
          .post(`/api/rates/requests/${rateRequestId}/respond`)
          .set('Authorization', `Bearer ${pricingToken}`)
          .send({
            requestedLineId: shippingLine!.id,
            requestedEquipTypeId: equipType!.id,
            // vesselName: missing
            // eta: missing
            // etd: missing
            validTo: '2024-02-20',
            chargesJson: {
              oceanFreight: 1850,
              bunkerAdjustment: 125,
              currency: 'USD'
            }
          })
          .expect(400);

        // Now respond with vessel details - should succeed
        await request(app.getHttpServer())
          .post(`/api/rates/requests/${rateRequestId}/respond`)
          .set('Authorization', `Bearer ${pricingToken}`)
          .send({
            requestedLineId: shippingLine!.id,
            requestedEquipTypeId: equipType!.id,
            vesselName: 'MSC JADE',
            eta: '2024-02-25T10:00:00Z',
            etd: '2024-02-15T14:00:00Z',
            validTo: '2024-02-20',
            chargesJson: {
              oceanFreight: 1850,
              bunkerAdjustment: 125,
              currency: 'USD'
            }
          })
          .expect(201);
      });
    });

    describe('3. Single selected line quote', () => {
      it('should allow only one selected line quote per rate request', async () => {
        // Create a rate request first
        const customer = await prisma.customer.findFirst({
          where: { approvalStatus: 'APPROVED' }
        });
        
        const pol = await prisma.port.findFirst({
          where: { unlocode: 'LKCMB' }
        });
        
        const pod = await prisma.port.findFirst({
          where: { unlocode: 'DEHAM' }
        });
        
        const equipType = await prisma.equipmentType.findFirst({
          where: { name: '40ft Container' }
        });

        const rateRequestResponse = await request(app.getHttpServer())
          .post('/api/rates/requests')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            mode: 'SEA',
            type: 'FCL',
            polId: pol!.id,
            podId: pod!.id,
            doorOrCy: 'CY',
            equipTypeId: equipType!.id,
            hsCode: '0902.30',
            weightTons: 15.5,
            incoterm: 'FOB',
            cargoReadyDate: '2024-02-15',
            vesselRequired: false,
            detentionFreeTime: 'FOURTEEN',
            customerId: customer!.id,
          })
          .expect(201);

        const rateRequestId = rateRequestResponse.body.id;

        // Login as pricing user
        const pricingLoginResponse = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: 'saman@freightco.lk',
            password: 'password123',
          })
          .expect(201);

        const pricingToken = pricingLoginResponse.body.access_token;

        const mscLine = await prisma.shippingLine.findFirst({
          where: { code: 'MSC' }
        });
        
        const maerskLine = await prisma.shippingLine.findFirst({
          where: { code: 'MAERSK' }
        });

        // Create first line quote (selected)
        await request(app.getHttpServer())
          .post(`/api/rates/requests/${rateRequestId}/line-quotes`)
          .set('Authorization', `Bearer ${pricingToken}`)
          .send({
            lineId: mscLine!.id,
            termsJson: {
              oceanFreight: 1850,
              bunkerAdjustment: 125,
              totalCost: 1975,
              currency: 'USD'
            },
            validTo: '2024-02-20',
            selected: true
          })
          .expect(201);

        // Create second line quote (also selected) - should unselect the first
        await request(app.getHttpServer())
          .post(`/api/rates/requests/${rateRequestId}/line-quotes`)
          .set('Authorization', `Bearer ${pricingToken}`)
          .send({
            lineId: maerskLine!.id,
            termsJson: {
              oceanFreight: 1900,
              bunkerAdjustment: 130,
              totalCost: 2030,
              currency: 'USD'
            },
            validTo: '2024-02-20',
            selected: true
          })
          .expect(201);

        // Verify only one quote is selected
        const selectedQuotes = await prisma.lineQuote.findMany({
          where: {
            rateRequestId,
            selected: true
          }
        });

        expect(selectedQuotes).toHaveLength(1);
        expect(selectedQuotes[0].lineId).toBe(maerskLine!.id);
      });
    });

    describe('4. Booking cancel requires reason', () => {
      it('should require cancel reason when cancelling booking', async () => {
        // Create a predefined rate first
        const tradeLane = await prisma.tradeLane.findFirst({
          where: { code: 'AE' }
        });
        
        const pol = await prisma.port.findFirst({
          where: { unlocode: 'LKCMB' }
        });
        
        const pod = await prisma.port.findFirst({
          where: { unlocode: 'DEHAM' }
        });
        
        const equipType = await prisma.equipmentType.findFirst({
          where: { name: '40ft Container' }
        });

        const predefinedRate = await prisma.predefinedRate.create({
          data: {
            tradeLaneId: tradeLane!.id,
            polId: pol!.id,
            podId: pod!.id,
            service: 'TEST SERVICE',
            equipTypeId: equipType!.id,
            isLcl: false,
            validFrom: new Date(),
            validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            status: 'ACTIVE',
            chargesJson: {
              oceanFreight: 1850,
              bunkerAdjustment: 125,
              currency: 'USD'
            }
          }
        });

        const customer = await prisma.customer.findFirst({
          where: { approvalStatus: 'APPROVED' }
        });

        // Create booking request
        const bookingResponse = await request(app.getHttpServer())
          .post('/api/booking/requests')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            customerId: customer!.id,
            rateSource: 'predefined',
            linkId: predefinedRate.id
          })
          .expect(201);

        const bookingId = bookingResponse.body.id;

        // Try to cancel without reason - should fail
        await request(app.getHttpServer())
          .post(`/api/booking/requests/${bookingId}/cancel`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            // cancelReason: missing
          })
          .expect(400);

        // Cancel with reason - should succeed
        await request(app.getHttpServer())
          .post(`/api/booking/requests/${bookingId}/cancel`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            cancelReason: 'Customer changed requirements'
          })
          .expect(200);

        // Verify booking is cancelled with reason
        const booking = await prisma.bookingRequest.findUnique({
          where: { id: bookingId }
        });

        expect(booking!.status).toBe('CANCELLED');
        expect(booking!.cancelReason).toBe('Customer changed requirements');
      });
    });
  });

  describe('Authentication & Authorization', () => {
    it('should require authentication for protected routes', async () => {
      await request(app.getHttpServer())
        .get('/api/rates/requests')
        .expect(401);
    });

    it('should enforce role-based access control', async () => {
      // Sales user trying to access admin-only route
      await request(app.getHttpServer())
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.service).toBe('freight-pricing-api');
    });
  });
});