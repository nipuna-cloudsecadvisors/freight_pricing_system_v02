import { PrismaClient, UserRole, UserStatus, ApprovalStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create SBUs first
  const sbu1 = await prisma.sbu.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Export Sales Unit 1',
      headUserId: '550e8400-e29b-41d4-a716-446655440011', // Will be created below
    },
  });

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440010',
      name: 'System Admin',
      email: 'admin@freightco.lk',
      phone: '+94771234567',
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const sbuHead = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440011',
      name: 'Rajesh Silva',
      email: 'rajesh@freightco.lk',
      phone: '+94771234568',
      password: hashedPassword,
      role: UserRole.SBU_HEAD,
      sbuId: sbu1.id,
      status: UserStatus.ACTIVE,
    },
  });

  const salesperson1 = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440012',
      name: 'Priya Fernando',
      email: 'priya@freightco.lk',
      phone: '+94771234569',
      password: hashedPassword,
      role: UserRole.SALES,
      sbuId: sbu1.id,
      status: UserStatus.ACTIVE,
    },
  });

  const salesperson2 = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440013',
      name: 'Kamal Perera',
      email: 'kamal@freightco.lk',
      phone: '+94771234570',
      password: hashedPassword,
      role: UserRole.SALES,
      sbuId: sbu1.id,
      status: UserStatus.ACTIVE,
    },
  });

  const cse1 = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440014',
      name: 'Nimal Jayasinghe',
      email: 'nimal@freightco.lk',
      phone: '+94771234571',
      password: hashedPassword,
      role: UserRole.CSE,
      status: UserStatus.ACTIVE,
    },
  });

  const pricing1 = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440015',
      name: 'Saman Rathnayake',
      email: 'saman@freightco.lk',
      phone: '+94771234572',
      password: hashedPassword,
      role: UserRole.PRICING,
      status: UserStatus.ACTIVE,
    },
  });

  const pricing2 = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440016',
      name: 'Dilani Wickramasinghe',
      email: 'dilani@freightco.lk',
      phone: '+94771234573',
      password: hashedPassword,
      role: UserRole.PRICING,
      status: UserStatus.ACTIVE,
    },
  });

  const mgmt1 = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440017',
      name: 'Chaminda Gunawardena',
      email: 'chaminda@freightco.lk',
      phone: '+94771234574',
      password: hashedPassword,
      role: UserRole.MGMT,
      status: UserStatus.ACTIVE,
    },
  });

  // Create Ports
  const colombo = await prisma.port.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440020',
      unlocode: 'LKCMB',
      name: 'Colombo',
      country: 'Sri Lanka',
    },
  });

  const singapore = await prisma.port.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440021',
      unlocode: 'SGSIN',
      name: 'Singapore',
      country: 'Singapore',
    },
  });

  const dubai = await prisma.port.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440022',
      unlocode: 'AEJEA',
      name: 'Jebel Ali',
      country: 'UAE',
    },
  });

  const hamburg = await prisma.port.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440023',
      unlocode: 'DEHAM',
      name: 'Hamburg',
      country: 'Germany',
    },
  });

  const losAngeles = await prisma.port.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440024',
      unlocode: 'USLAX',
      name: 'Los Angeles',
      country: 'USA',
    },
  });

  const newYork = await prisma.port.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440025',
      unlocode: 'USNYC',
      name: 'New York',
      country: 'USA',
    },
  });

  // Create Trade Lanes
  const asiaEurope = await prisma.tradeLane.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440030',
      region: 'Asia-Europe',
      name: 'Asia to Europe',
      code: 'AE',
    },
  });

  const asiaNorthAmerica = await prisma.tradeLane.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440031',
      region: 'Asia-North America',
      name: 'Asia to North America',
      code: 'ANA',
    },
  });

  const asiaMiddleEast = await prisma.tradeLane.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440032',
      region: 'Asia-Middle East',
      name: 'Asia to Middle East',
      code: 'AME',
    },
  });

  // Create Shipping Lines
  const msc = await prisma.shippingLine.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440040',
      name: 'Mediterranean Shipping Company',
      code: 'MSC',
    },
  });

  const maersk = await prisma.shippingLine.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440041',
      name: 'A.P. Moller-Maersk',
      code: 'MAERSK',
    },
  });

  const cma = await prisma.shippingLine.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440042',
      name: 'CMA CGM',
      code: 'CMA',
    },
  });

  const evergreen = await prisma.shippingLine.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440043',
      name: 'Evergreen Marine',
      code: 'EMC',
    },
  });

  // Create Equipment Types
  const container20 = await prisma.equipmentType.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440050',
      name: '20ft Container',
      isReefer: false,
      isFlatRackOpenTop: false,
    },
  });

  const container40 = await prisma.equipmentType.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440051',
      name: '40ft Container',
      isReefer: false,
      isFlatRackOpenTop: false,
    },
  });

  const container40hc = await prisma.equipmentType.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440052',
      name: '40ft High Cube',
      isReefer: false,
      isFlatRackOpenTop: false,
    },
  });

  const reefer20 = await prisma.equipmentType.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440053',
      name: '20ft Reefer',
      isReefer: true,
      isFlatRackOpenTop: false,
    },
  });

  const reefer40 = await prisma.equipmentType.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440054',
      name: '40ft Reefer',
      isReefer: true,
      isFlatRackOpenTop: false,
    },
  });

  const flatRack20 = await prisma.equipmentType.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440055',
      name: '20ft Flat Rack',
      isReefer: false,
      isFlatRackOpenTop: true,
    },
  });

  const openTop40 = await prisma.equipmentType.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440056',
      name: '40ft Open Top',
      isReefer: false,
      isFlatRackOpenTop: true,
    },
  });

  // Create Pricing Team Assignments
  await prisma.pricingTeamAssignment.create({
    data: {
      tradeLaneId: asiaEurope.id,
      userId: pricing1.id,
    },
  });

  await prisma.pricingTeamAssignment.create({
    data: {
      tradeLaneId: asiaNorthAmerica.id,
      userId: pricing2.id,
    },
  });

  await prisma.pricingTeamAssignment.create({
    data: {
      tradeLaneId: asiaMiddleEast.id,
      userId: pricing1.id,
    },
  });

  // Create Sample Customers
  const customer1 = await prisma.customer.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440060',
      name: 'Ceylon Tea Exports Ltd',
      email: 'info@ceylontea.lk',
      phone: '+94112345678',
      address: '123 Export House, Colombo 01',
      contactPerson: 'Mr. Sunil Perera',
      approvalStatus: ApprovalStatus.APPROVED,
      createdBy: admin.id,
      approvedBy: admin.id,
      approvedAt: new Date(),
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440061',
      name: 'Spice Island Trading Co',
      email: 'exports@spiceisland.lk',
      phone: '+94112345679',
      address: '456 Trade Center, Colombo 02',
      contactPerson: 'Ms. Kamala Silva',
      approvalStatus: ApprovalStatus.APPROVED,
      createdBy: admin.id,
      approvedBy: admin.id,
      approvedAt: new Date(),
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440062',
      name: 'Rubber Products International',
      email: 'sales@rubberproducts.lk',
      phone: '+94112345680',
      address: '789 Industrial Zone, Colombo 15',
      contactPerson: 'Mr. Ravi Jayawardena',
      approvalStatus: ApprovalStatus.PENDING,
      createdBy: salesperson1.id,
    },
  });

  // Create Sample Predefined Rates
  const now = new Date();
  const validFrom = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
  const validTo = new Date(now.getFullYear(), now.getMonth() + 2, 0); // Last day of next month
  const expiredValidTo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const expiringSoonValidTo = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

  // Active rate
  await prisma.predefinedRate.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440070',
      tradeLaneId: asiaEurope.id,
      polId: colombo.id,
      podId: hamburg.id,
      service: 'MSC JADE',
      equipTypeId: container40.id,
      isLcl: false,
      validFrom: validFrom,
      validTo: validTo,
      status: 'ACTIVE',
      notes: 'Weekly service, direct call',
      chargesJson: {
        oceanFreight: 1850,
        bunkerAdjustment: 125,
        currency: 'USD',
        per: 'container',
      },
    },
  });

  // Expired rate
  await prisma.predefinedRate.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440071',
      tradeLaneId: asiaNorthAmerica.id,
      polId: colombo.id,
      podId: losAngeles.id,
      service: 'MAERSK ESSEX',
      equipTypeId: container40hc.id,
      isLcl: false,
      validFrom: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      validTo: expiredValidTo,
      status: 'EXPIRED',
      notes: 'Transpacific service via Singapore',
      chargesJson: {
        oceanFreight: 2100,
        bunkerAdjustment: 150,
        currency: 'USD',
        per: 'container',
      },
    },
  });

  // Expiring soon rate
  await prisma.predefinedRate.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440072',
      tradeLaneId: asiaMiddleEast.id,
      polId: colombo.id,
      podId: dubai.id,
      service: 'CMA CGM BUTTERFLY',
      equipTypeId: container20.id,
      isLcl: false,
      validFrom: validFrom,
      validTo: expiringSoonValidTo,
      status: 'ACTIVE',
      notes: 'Middle East service',
      chargesJson: {
        oceanFreight: 750,
        bunkerAdjustment: 85,
        currency: 'USD',
        per: 'container',
      },
    },
  });

  // Create Sample Leads
  const lead1 = await prisma.lead.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440080',
      companyName: 'Global Textile Exports',
      contact: 'Mr. Anura Bandara (+94771234581)',
      stage: 'QUALIFIED',
      ownerId: salesperson1.id,
      source: 'Trade Fair',
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440081',
      companyName: 'Coconut Products Ltd',
      contact: 'Ms. Sandya Perera (+94771234582)',
      stage: 'PROSPECT',
      ownerId: salesperson2.id,
      source: 'Website Inquiry',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('👤 Test Users Created:');
  console.log('Admin: admin@freightco.lk / password123');
  console.log('SBU Head: rajesh@freightco.lk / password123');
  console.log('Sales Person 1: priya@freightco.lk / password123');
  console.log('Sales Person 2: kamal@freightco.lk / password123');
  console.log('CSE: nimal@freightco.lk / password123');
  console.log('Pricing 1: saman@freightco.lk / password123');
  console.log('Pricing 2: dilani@freightco.lk / password123');
  console.log('Management: chaminda@freightco.lk / password123');
  console.log('');
  console.log('🏢 Sample Data:');
  console.log('- 3 Trade Lanes (Asia-Europe, Asia-North America, Asia-Middle East)');
  console.log('- 6 Ports (Colombo, Singapore, Dubai, Hamburg, Los Angeles, New York)');
  console.log('- 4 Shipping Lines (MSC, Maersk, CMA CGM, Evergreen)');
  console.log('- 7 Equipment Types (20ft, 40ft, 40HC, Reefers, Flat Rack, Open Top)');
  console.log('- 3 Customers (2 approved, 1 pending)');
  console.log('- 3 Predefined Rates (1 active, 1 expired, 1 expiring soon)');
  console.log('- 2 Sample Leads');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });