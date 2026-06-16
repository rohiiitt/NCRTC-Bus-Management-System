const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
  const today = new Date('2026-05-30');
  const duties = await p.duty.findMany({
    where: { date: { gte: today } },
    include: { driver: true, vehicle: true }
  });
  console.log('Drivers WITH duties today:');
  duties.forEach(d => console.log(' -', d.driver.fullName, '| vehicle:', d.vehicle.regNo, '| status:', d.status));

  const allDrivers = await p.user.findMany({ where: { role: 'driver' } });
  const busyIds = duties.map(d => d.driverId);
  console.log('\nDrivers WITHOUT duties (use these to create new duty):');
  allDrivers.filter(u => !busyIds.includes(u.id)).forEach(u => console.log(' -', u.fullName, '| id:', u.id));

  await p.$disconnect();
}

run();