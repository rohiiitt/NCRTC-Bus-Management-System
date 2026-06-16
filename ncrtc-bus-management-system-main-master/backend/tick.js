// tick.js
// Fake GPS simulator — run separately: npm run tick
// Moves each active vehicle slightly every 5 seconds
// Calls POST /avls/ping on the backend

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let tickCount = 0;

async function tick() {
  tickCount++;

  const vehicles = await prisma.vehicle.findMany({
    where:   { status: 'active' },
    include: { pings: { orderBy: { ts: 'desc' }, take: 1 } },
  });

  for (const v of vehicles) {
    const last = v.pings[0];
    if (!last) continue;

    // Move slightly — realistic bus movement
    const latDelta = (Math.random() - 0.5) * 0.002;
    const lngDelta = (Math.random() - 0.5) * 0.002;

    await prisma.gpsPing.create({
      data: {
        vehicleId:  v.id,
        lat:        last.lat + latDelta,
        lng:        last.lng + lngDelta,
        speedKmh:   Math.round(10 + Math.random() * 40),
        ignitionOn: true,
      },
    });
  }

  if (tickCount % 10 === 0) {
    // Log every 10 ticks (every 50 seconds)
    console.log(`[${new Date().toLocaleTimeString()}] Tick #${tickCount} — ${vehicles.length} vehicles updated`);
  } else {
    process.stdout.write('.');
  }
}

console.log('🛰️  GPS Tick script started. Press Ctrl+C to stop.');
console.log('   Updating vehicle positions every 5 seconds...\n');

// Run immediately then every 5 seconds
tick();
const interval = setInterval(tick, 5000);

// Clean exit
process.on('SIGINT', async () => {
  clearInterval(interval);
  await prisma.$disconnect();
  console.log('\n\n⏹️  Tick script stopped.');
  process.exit(0);
});
