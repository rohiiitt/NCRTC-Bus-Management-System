// prisma/seed.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function main() {
  try {
    console.log('🌱 Starting NCRTC seed...\n');

    // ── CLEANUP (child → parent order) ─────────────────────
    await prisma.noticeRead.deleteMany();
    await prisma.notice.deleteMany();
    await prisma.incidentEvent.deleteMany();
    await prisma.incident.deleteMany();
    await prisma.gpsPing.deleteMany();
    await prisma.duty.deleteMany();
    await prisma.routeStop.deleteMany();
    await prisma.route.deleteMany();
    await prisma.stop.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
    await prisma.depot.deleteMany();

    console.log('🗑️ Cleaned old data');

    // ── DEPOTS ─────────────────────────────────────────────
    const depot1 = await prisma.depot.create({
      data: {
        code: 'NOI37',
        name: 'Noida Sector 37 Depot',
        locationLat: 28.5706,
        locationLng: 77.3261,
      },
    });

    const depot2 = await prisma.depot.create({
      data: {
        code: 'ANV',
        name: 'Anand Vihar Depot',
        locationLat: 28.6469,
        locationLng: 77.3160,
      },
    });

    const depot3 = await prisma.depot.create({
      data: {
        code: 'GZB',
        name: 'Ghaziabad Depot',
        locationLat: 28.6692,
        locationLng: 77.4538,
      },
    });

    console.log('🏢 Depots created');

    // ── PASSWORD HASH ──────────────────────────────────────
    const hash = await bcrypt.hash('password', 10);

    // ⚠️ IMPORTANT:
    // Ensure these role strings EXACTLY match your Prisma enum
    const admin = await prisma.user.create({
      data: {
        username: 'admin1',
        passwordHash: hash,
        fullName: 'Amit Sharma',
        role: 'admin',
      },
    });

    const operator = await prisma.user.create({
      data: {
        username: 'operator1',
        passwordHash: hash,
        fullName: 'Priya Singh',
        role: 'control_operator',
      },
    });

    const manager1 = await prisma.user.create({
      data: {
        username: 'manager1',
        passwordHash: hash,
        fullName: 'Rakesh Kumar',
        role: 'depot_manager',
        depotId: depot1.id,
      },
    });

    const manager2 = await prisma.user.create({
      data: {
        username: 'manager2',
        passwordHash: hash,
        fullName: 'Sunita Verma',
        role: 'depot_manager',
        depotId: depot2.id,
      },
    });

    const driver1 = await prisma.user.create({
      data: {
        username: 'driver1',
        passwordHash: hash,
        fullName: 'Rajesh Yadav',
        role: 'driver',
        depotId: depot1.id,
        phone: '9876543210',
      },
    });

    const driver2 = await prisma.user.create({
      data: {
        username: 'driver2',
        passwordHash: hash,
        fullName: 'Suresh Gupta',
        role: 'driver',
        depotId: depot1.id,
        phone: '9876543211',
      },
    });

    const driver3 = await prisma.user.create({
      data: {
        username: 'driver3',
        passwordHash: hash,
        fullName: 'Mahesh Tiwari',
        role: 'driver',
        depotId: depot2.id,
        phone: '9876543212',
      },
    });

    const driver4 = await prisma.user.create({
      data: {
        username: 'driver4',
        passwordHash: hash,
        fullName: 'Ramesh Pandey',
        role: 'driver',
        depotId: depot1.id,
        phone: '9876543213',
      },
    });

    console.log('👤 Users created');

    // ── VEHICLES ───────────────────────────────────────────
    const v1 = await prisma.vehicle.create({ data: { regNo: 'UP32AB1234', depotId: depot1.id, status: 'active' } });
    const v2 = await prisma.vehicle.create({ data: { regNo: 'UP32AB1235', depotId: depot1.id, status: 'active' } });
    const v3 = await prisma.vehicle.create({ data: { regNo: 'UP32AB1236', depotId: depot1.id, status: 'maintenance' } });

    console.log('🚌 Vehicles created');

    // ── IMPORTANT DEBUG TIP ────────────────────────────────
    // If it fails here → YOUR ENUMS / SCHEMA DO NOT MATCH

    console.log('⚠️ If error occurs now → check Prisma schema enums & field names');

    console.log('\n✅ SEED COMPLETED SUCCESSFULLY');

  } catch (err) {
    console.error('\n❌ SEED FAILED\n');
    console.error(err);
    process.exit(1);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });