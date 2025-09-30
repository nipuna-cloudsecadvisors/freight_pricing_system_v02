import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create SBUs
  const sbu1 = await prisma.sbu.create({
    data: {
      name: 'Colombo Operations',
      headUserId: '', // Will be updated after creating users
    },
  });

  const sbu2 = await prisma.sbu.create({
    data: {
      name: 'Galle Operations',
      headUserId: '', // Will be updated after creating users
    },
  });

  // Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@freightpricing.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const sbuHead1 = await prisma.user.create({
    data: {
      name: 'John Smith',
      email: 'john.smith@freightpricing.com',
      password: await bcrypt.hash('password123', 10),
      role: 'SBU_HEAD',
      sbuId: sbu1.id,
      status: 'ACTIVE',
    },
  });

  const sbuHead2 = await prisma.user.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@freightpricing.com',
      password: await bcrypt.hash('password123', 10),
      role: 'SBU_HEAD',
      sbuId: sbu2.id,
      status: 'ACTIVE',
    },
  });

  const salesUser1 = await prisma.user.create({
    data: {
      name: 'Mike Wilson',
      email: 'mike.wilson@freightpricing.com',
      password: await bcrypt.hash('password123', 10),
      role: 'SALES',
      sbuId: sbu1.id,
      status: 'ACTIVE',
    },
  });

  const salesUser2 = await prisma.user.create({
    data: {
      name: 'Lisa Brown',
      email: 'lisa.brown@freightpricing.com',
      password: await bcrypt.hash('password123', 10),
      role: 'SALES',
      sbuId: sbu2.id,
      status: 'ACTIVE',
    },
  });

  const cseUser1 = await prisma.user.create({
    data: {
      name: 'David Lee',
      email: 'david.lee@freightpricing.com',
      password: await bcrypt.hash('password123', 10),
      role: 'CSE',
      sbuId: sbu1.id,
      status: 'ACTIVE',
    },
  });

  const pricingUser1 = await prisma.user.create({
    data: {
      name: 'Emma Davis',
      email: 'emma.davis@freightpricing.com',
      password: await bcrypt.hash('password123', 10),
      role: 'PRICING',
      status: 'ACTIVE',
    },
  });

  const mgmtUser = await prisma.user.create({
    data: {
      name: 'Robert Taylor',
      email: 'robert.taylor@freightpricing.com',
      password: await bcrypt.hash('password123', 10),
      role: 'MGMT',
      status: 'ACTIVE',
    },
  });

  // Update SBU head user IDs
  await prisma.sbu.update({
    where: { id: sbu1.id },
    data: { headUserId: sbuHead1.id },
  });

  await prisma.sbu.update({
    where: { id: sbu2.id },
    data: { headUserId: sbuHead2.id },
  });

  // Create Ports
  const colomboPort = await prisma.port.create({
    data: {
      unlocode: 'LKCMB',
      name: 'Colombo',
      country: 'Sri Lanka',
    },
  });

  const hamburgPort = await prisma.port.create({
    data: {
      unlocode: 'DEHAM',
      name: 'Hamburg',
      country: 'Germany',
    },
  });

  const singaporePort = await prisma.port.create({
    data: {
      unlocode: 'SGSIN',
      name: 'Singapore',
      country: 'Singapore',
    },
  });

  const dubaiPort = await prisma.port.create({
    data: {
      unlocode: 'AEDXB',
      name: 'Dubai',
      country: 'UAE',
    },
  });

  // Create Trade Lanes
  const europeLane = await prisma.tradeLane.create({
    data: {
      region: 'Europe',
      name: 'Colombo to Europe',
      code: 'CMB-EU',
    },
  });

  const asiaLane = await prisma.tradeLane.create({
    data: {
      region: 'Asia',
      name: 'Colombo to Asia',
      code: 'CMB-AS',
    },
  });

  // Create Equipment Types
  const dryContainer = await prisma.equipmentType.create({
    data: {
      name: '20ft Dry Container',
      isReefer: false,
      isFlatRackOpenTop: false,
    },
  });

  const dryContainer40 = await prisma.equipmentType.create({
    data: {
      name: '40ft Dry Container',
      isReefer: false,
      isFlatRackOpenTop: false,
    },
  });

  const reeferContainer = await prisma.equipmentType.create({
    data: {
      name: '40ft Reefer Container',
      isReefer: true,
      isFlatRackOpenTop: false,
    },
  });

  const flatRack = await prisma.equipmentType.create({
    data: {
      name: '40ft Flat Rack',
      isReefer: false,
      isFlatRackOpenTop: true,
    },
  });

  // Create Shipping Lines
  const msc = await prisma.shippingLine.create({
    data: {
      name: 'Mediterranean Shipping Company',
      code: 'MSC',
    },
  });

  const maersk = await prisma.shippingLine.create({
    data: {
      name: 'Maersk Line',
      code: 'MAEU',
    },
  });

  const cma = await prisma.shippingLine.create({
    data: {
      name: 'CMA CGM',
      code: 'CMACGM',
    },
  });

  // Create Pricing Team Assignments
  await prisma.pricingTeamAssignment.create({
    data: {
      tradeLaneId: europeLane.id,
      userId: pricingUser1.id,
    },
  });

  await prisma.pricingTeamAssignment.create({
    data: {
      tradeLaneId: asiaLane.id,
      userId: pricingUser1.id,
    },
  });

  // Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      companyName: 'ABC Trading Company',
      contactPerson: 'John Doe',
      email: 'john@abctrading.com',
      phone: '+94 77 123 4567',
      address: '123 Main Street, Colombo 01',
      city: 'Colombo',
      country: 'Sri Lanka',
      approvalStatus: 'APPROVED',
      createdById: salesUser1.id,
      approvedById: adminUser.id,
      approvedAt: new Date(),
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      companyName: 'XYZ Exporters',
      contactPerson: 'Jane Smith',
      email: 'jane@xyzexporters.com',
      phone: '+94 77 987 6543',
      address: '456 Business Avenue, Galle',
      city: 'Galle',
      country: 'Sri Lanka',
      approvalStatus: 'PENDING',
      createdById: salesUser2.id,
    },
  });

  // Create Predefined Rates
  await prisma.predefinedRate.create({
    data: {
      tradeLaneId: europeLane.id,
      polId: colomboPort.id,
      podId: hamburgPort.id,
      service: 'Weekly Service',
      equipTypeId: dryContainer40.id,
      isLcl: false,
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2024-12-31'),
      status: 'active',
      notes: 'Standard rate for 40ft containers',
    },
  });

  await prisma.predefinedRate.create({
    data: {
      tradeLaneId: asiaLane.id,
      polId: colomboPort.id,
      podId: singaporePort.id,
      service: 'Bi-weekly Service',
      equipTypeId: dryContainer.id,
      isLcl: false,
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2024-12-31'),
      status: 'active',
      notes: 'Standard rate for 20ft containers',
    },
  });

  // Create a sample rate request
  const rateRequest = await prisma.rateRequest.create({
    data: {
      refNo: 'RR20240101001',
      mode: 'SEA',
      type: 'FCL',
      polId: colomboPort.id,
      podId: dubaiPort.id,
      equipTypeId: dryContainer40.id,
      weightTons: 25.5,
      incoterm: 'FOB',
      cargoReadyDate: new Date('2024-02-15'),
      salespersonId: salesUser1.id,
      customerId: customer1.id,
      status: 'PENDING',
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📋 Created:');
  console.log('- 2 SBUs');
  console.log('- 7 Users (Admin, SBU Heads, Sales, CSE, Pricing, Management)');
  console.log('- 4 Ports (Colombo, Hamburg, Singapore, Dubai)');
  console.log('- 2 Trade Lanes (Europe, Asia)');
  console.log('- 4 Equipment Types');
  console.log('- 3 Shipping Lines');
  console.log('- 2 Customers (1 approved, 1 pending)');
  console.log('- 2 Predefined Rates');
  console.log('- 1 Sample Rate Request');
  console.log('\n🔑 Login credentials:');
  console.log('Admin: admin@freightpricing.com / admin123');
  console.log('Sales: mike.wilson@freightpricing.com / password123');
  console.log('Pricing: emma.davis@freightpricing.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
