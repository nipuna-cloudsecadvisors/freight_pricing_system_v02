import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/freight_pricing_test'
    }
  }
});

beforeAll(async () => {
  // Ensure test database is clean
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});