const prisma = require('../lib/prisma');

async function getLiveMap(req, res) {
  try {
    const depotWhere = req.depotFilter ? { depotId: req.depotFilter } : {};

    const vehicles = await prisma.vehicle.findMany({
      where: { status: 'active', ...depotWhere },
      include: {
        pings: { orderBy: { ts: 'desc' }, take: 1 },
        depot: { select: { name: true, code: true } },
        duties: {
          where: { status: { in: ['published', 'acknowledged'] } },
          include: {
            driver: { select: { fullName: true, phone: true } },
            route: { select: { name: true, code: true } },
          },
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    const liveVehicles = vehicles
      .filter(v => v.pings.length > 0)
      .map(v => ({
        vehicleId: v.id,
        regNo: v.regNo,
        depotId: v.depotId,
        depot: v.depot.name,
        lat: v.pings[0].lat,
        lng: v.pings[0].lng,
        speed: Math.round(v.pings[0].speedKmh),
        lastSeen: v.pings[0].ts,
        ignition: v.pings[0].ignitionOn,
        driver: v.duties[0]?.driver?.fullName || 'No driver',
        driverPhone: v.duties[0]?.driver?.phone || null,
        route: v.duties[0]?.route?.name || 'No route',
        routeCode: v.duties[0]?.route?.code || '',
      }));

    res.json({ vehicles: liveVehicles, count: liveVehicles.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getVehicleHistory(req, res) {
  try {
    const vehicleId = parseInt(req.params.vehicleId);
    const dateStr = req.query.date;
    const date = dateStr ? new Date(dateStr) : new Date();
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);

    const [vehicle, pings] = await Promise.all([
      prisma.vehicle.findUnique({
        where: { id: vehicleId },
        select: { regNo: true, depot: { select: { name: true } } },
      }),
      prisma.gpsPing.findMany({
        where: { vehicleId, ts: { gte: start, lte: end } },
        orderBy: { ts: 'asc' },
      }),
    ]);

    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ vehicle, pings, count: pings.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

async function getRecentPings(req, res) {
  try {
    const vehicleId = parseInt(req.params.vehicleId);
    const since = new Date(Date.now() - 30 * 60 * 1000);
    const pings = await prisma.gpsPing.findMany({
      where: { vehicleId, ts: { gte: since } },
      orderBy: { ts: 'asc' },
    });
    res.json({ pings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

async function insertPing(req, res) {
  try {
    const { vehicleId, lat, lng, speedKmh, ignitionOn } = req.body;
    if (!vehicleId || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'vehicleId, lat, lng required' });
    }
    const ping = await prisma.gpsPing.create({
      data: {
        vehicleId: parseInt(vehicleId),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        speedKmh: parseFloat(speedKmh) || 0,
        ignitionOn: ignitionOn !== false,
      },
    });
    res.status(201).json({ ping });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

async function getVehicleList(req, res) {
  try {
    const depotWhere = req.depotFilter ? { depotId: req.depotFilter } : {};
    const vehicles = await prisma.vehicle.findMany({
      where: depotWhere,
      select: { id: true, regNo: true, status: true, depot: { select: { name: true } } },
      orderBy: { regNo: 'asc' },
    });
    res.json({ vehicles });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getLiveMap, getVehicleHistory, getRecentPings, insertPing, getVehicleList };