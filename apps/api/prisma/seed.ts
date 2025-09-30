import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Colombo port
  const colombo = await prisma.port.upsert({
    where: { unlocode: 'LKCMB' },
    update: {},
    create: {
      unlocode: 'LKCMB',
      name: 'Colombo',
      country: 'Sri Lanka',
    },
  });

  // Create other ports
  const singapore = await prisma.port.upsert({
    where: { unlocode: 'SGSIN' },
    update: {},
    create: {
      unlocode: 'SGSIN',
      name: 'Singapore',
      country: 'Singapore',
    },
  });

  const dubai = await prisma.port.upsert({
    where: { unlocode: 'AEDXB' },
    update: {},
    create: {
      unlocode: 'AEDXB',
      name: 'Dubai',
      country: 'UAE',
    },
  });

  // Create trade lanes
  const asiaTradeLane = await prisma.tradeLane.upsert({
    where: { code: 'CMB-SIN' },
    update: {},
    create: {
      region: 'Asia',
      name: 'Colombo to Singapore',
      code: 'CMB-SIN',
    },
  });

  const middleEastTradeLane = await prisma.tradeLane.upsert({
    where: { code: 'CMB-DXB' },
    update: {},
    create: {
      region: 'Middle East',
      name: 'Colombo to Dubai',
      code: 'CMB-DXB',
    },
  });

  // Create equipment types
  const dry20 = await prisma.equipmentType.upsert({
    where: { name: '20ft Dry Container' },
    update: {},
    create: {
      name: '20ft Dry Container',
      isReefer: false,
      isFlatRackOpenTop: false,
    },
  });

  const dry40 = await prisma.equipmentType.upsert({
    where: { name: '40ft Dry Container' },
    update: {},
    create: {
      name: '40ft Dry Container',
      isReefer: false,
      isFlatRackOpenTop: false,
    },
  });

  const reefer20 = await prisma.equipmentType.upsert({
    where: { name: '20ft Reefer Container' },
    update: {},
    create: {
      name: '20ft Reefer Container',
      isReefer: true,
      isFlatRackOpenTop: false,
    },
  });

  const flatRack40 = await prisma.equipmentType.upsert({
    where: { name: '40ft Flat Rack' },
    update: {},
    create: {
      name: '40ft Flat Rack',
      isReefer: false,
      isFlatRackOpenTop: true,
    },
  });

  // Create shipping lines
  const maersk = await prisma.shippingLine.upsert({
    where: { code: 'MAEU' },
    update: {},
    create: {
      name: 'Maersk Line',
      code: 'MAEU',
    },
  });

  const msc = await prisma.shippingLine.upsert({
    where: { code: 'MSC' },
    update: {},
    create: {
      name: 'MSC',
      code: 'MSC',
    },
  });

  const cma = await prisma.shippingLine.upsert({
    where: { code: 'CMA' },
    update: {},
    create: {
      name: 'CMA CGM',
      code: 'CMA',
    },
  });

  // Create SBU
  const sbu = await prisma.sBU.upsert({
    where: { name: 'South Asia SBU' },
    update: {},
    create: {
      name: 'South Asia SBU',
      headUserId: '', // Will be updated after creating users
    },
  });

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@freight.com' },
    update: {},
    create: {
      email: 'admin@freight.com',
      name: 'System Administrator',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const sbuHeadPassword = await bcrypt.hash('sbu123', 10);
  const sbuHead = await prisma.user.upsert({
    where: { email: 'sbu@freight.com' },
    update: {},
    create: {
      email: 'sbu@freight.com',
      name: 'SBU Head',
      password: sbuHeadPassword,
      role: 'SBU_HEAD',
      status: 'ACTIVE',
      sbuId: sbu.id,
    },
  });

  const salesPassword = await bcrypt.hash('sales123', 10);
  const sales = await prisma.user.upsert({
    where: { email: 'sales@freight.com' },
    update: {},
    create: {
      email: 'sales@freight.com',
      name: 'Sales Person',
      password: salesPassword,
      role: 'SALES',
      status: 'ACTIVE',
      sbuId: sbu.id,
    },
  });

  const csePassword = await bcrypt.hash('cse123', 10);
  const cse = await prisma.user.upsert({
    where: { email: 'cse@freight.com' },
    update: {},
    create: {
      email: 'cse@freight.com',
      name: 'Customer Service Executive',
      password: csePassword,
      role: 'CSE',
      status: 'ACTIVE',
      sbuId: sbu.id,
    },
  });

  const pricingPassword = await bcrypt.hash('pricing123', 10);
  const pricing = await prisma.user.upsert({
    where: { email: 'pricing@freight.com' },
    update: {},
    create: {
      email: 'pricing@freight.com',
      name: 'Pricing Team Member',
      password: pricingPassword,
      role: 'PRICING',
      status: 'ACTIVE',
    },
  });

  const mgmtPassword = await bcrypt.hash('mgmt123', 10);
  const mgmt = await prisma.user.upsert({
    where: { email: 'mgmt@freight.com' },
    update: {},
    create: {
      email: 'mgmt@freight.com',
      name: 'Top Management',
      password: mgmtPassword,
      role: 'MGMT',
      status: 'ACTIVE',
    },
  });

  // Update SBU with head user
  await prisma.sBU.update({
    where: { id: sbu.id },
    data: { headUserId: sbuHead.id },
  });

  // Create pricing team assignments
  await prisma.pricingTeamAssignment.upsert({
    where: {
      tradeLaneId_userId: {
        tradeLaneId: asiaTradeLane.id,
        userId: pricing.id,
      },
    },
    update: {},
    create: {
      tradeLaneId: asiaTradeLane.id,
      userId: pricing.id,
    },
  });

  await prisma.pricingTeamAssignment.upsert({
    where: {
      tradeLaneId_userId: {
        tradeLaneId: middleEastTradeLane.id,
        userId: pricing.id,
      },
    },
    update: {},
    create: {
      tradeLaneId: middleEastTradeLane.id,
      userId: pricing.id,
    },
  });

  // Create sample customer
  const customer = await prisma.customer.upsert({
    where: { email: 'customer@abctrading.com' },
    update: {},
    create: {
      companyName: 'ABC Trading Company',
      contactName: 'John Smith',
      email: 'customer@abctrading.com',
      phone: '+94771234567',
      address: '123 Main Street, Colombo 01',
      city: 'Colombo',
      country: 'Sri Lanka',
      approvalStatus: 'APPROVED',
      createdById: sales.id,
      approvedById: admin.id,
      approvedAt: new Date(),
    },
  });

  // Create sample predefined rates
  const validFrom = new Date();
  const validTo = new Date();
  validTo.setDate(validTo.getDate() + 30);

  await prisma.predefinedRate.upsert({
    where: {
      tradeLaneId_polId_podId_service_equipTypeId: {
        tradeLaneId: asiaTradeLane.id,
        polId: colombo.id,
        podId: singapore.id,
        service: 'Weekly Service',
        equipTypeId: dry20.id,
      },
    },
    update: {},
    create: {
      tradeLaneId: asiaTradeLane.id,
      polId: colombo.id,
      podId: singapore.id,
      service: 'Weekly Service',
      equipTypeId: dry20.id,
      isLcl: false,
      validFrom,
      validTo,
      status: 'active',
      notes: 'Direct service to Singapore',
    },
  });

  await prisma.predefinedRate.upsert({
    where: {
      tradeLaneId_polId_podId_service_equipTypeId: {
        tradeLaneId: middleEastTradeLane.id,
        polId: colombo.id,
        podId: dubai.id,
        service: 'Bi-weekly Service',
        equipTypeId: dry40.id,
      },
    },
    update: {},
    create: {
      tradeLaneId: middleEastTradeLane.id,
      polId: colombo.id,
      podId: dubai.id,
      service: 'Bi-weekly Service',
      equipTypeId: dry40.id,
      isLcl: false,
      validFrom,
      validTo,
      status: 'active',
      notes: 'Transshipment via Singapore',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Sample Users Created:');
  console.log('Admin: admin@freight.com / admin123');
  console.log('SBU Head: sbu@freight.com / sbu123');
  console.log('Sales: sales@freight.com / sales123');
  console.log('CSE: cse@freight.com / cse123');
  console.log('Pricing: pricing@freight.com / pricing123');
  console.log('Management: mgmt@freight.com / mgmt123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });