// src/controllers/duty.controller.js
const prisma = require('../lib/prisma');

async function getRoster(req, res) {
  try {
    const dateStr = req.query.date;
    const date    = dateStr ? new Date(dateStr) : new Date();
    const start   = new Date(date); start.setHours(0, 0, 0, 0);
    const end     = new Date(date); end.setHours(23, 59, 59, 999);

    const depotWhere = req.depotFilter ? { vehicle: { depotId: req.depotFilter } } : {};

    const duties = await prisma.duty.findMany({
      where:   { date: { gte: start, lte: end }, ...depotWhere },
      include: {
        driver:  { select: { id: true, fullName: true, phone: true } },
        vehicle: { select: { id: true, regNo: true } },
        route:   { select: { id: true, name: true, code: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    res.json({ duties, count: duties.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

async function getMyDuty(req, res) {
  try {
    const today = new Date();
    const start = new Date(today); start.setHours(0, 0, 0, 0);
    const end   = new Date(today); end.setHours(23, 59, 59, 999);

    const duty = await prisma.duty.findFirst({
      where: { driverId: req.user.id, date: { gte: start, lte: end } },
      include: {
        vehicle: { select: { regNo: true } },
        route: {
          include: {
            stops: { include: { stop: true }, orderBy: { sequence: 'asc' } },
          },
        },
      },
    });

    if (!duty) return res.status(404).json({ message: 'No duty assigned for today' });
    res.json({ duty });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

async function createDuty(req, res) {
  try {
    console.log('=== createDuty called ===');
    console.log('BODY:', JSON.stringify(req.body));

    const { date, vehicleId, driverId, routeId, startTime, endTime } = req.body;

    if (!date || !vehicleId || !driverId || !routeId || !startTime || !endTime) {
      return res.status(400).json({ message: 'All fields required: date, vehicleId, driverId, routeId, startTime, endTime' });
    }

    // date is like "2026-05-30" or "2026-05-30T00:00:00.000Z"
    // startTime could be "06:00" or "2026-05-30T06:00:00.000Z"
    const dateOnly = new Date(date).toISOString().split('T')[0]; // "2026-05-30"
    console.log('dateOnly:', dateOnly);
    console.log('startTime raw:', startTime);
    console.log('endTime raw:', endTime);

    // Handle both "HH:MM" and full ISO formats
    let startDT, endDT;

    if (startTime && startTime.length === 5 && startTime.includes(':')) {
      // Format "06:00" — combine with date, treat as IST (UTC+5:30 = subtract 5.5h)
      startDT = new Date(`${dateOnly}T${startTime}:00+05:30`);
      endDT   = new Date(`${dateOnly}T${endTime}:00+05:30`);
    } else if (startTime && startTime.includes('T')) {
      // Already full ISO
      startDT = new Date(startTime);
      endDT   = new Date(endTime);
    } else {
      // Fallback: try direct parse
      startDT = new Date(startTime);
      endDT   = new Date(endTime);
    }

    console.log('startDT:', startDT);
    console.log('endDT:', endDT);
    console.log('startDT valid:', !isNaN(startDT.getTime()));

    if (isNaN(startDT.getTime()) || isNaN(endDT.getTime())) {
      return res.status(400).json({
        message: `Cannot parse times. Got startTime="${startTime}", endTime="${endTime}". Use format HH:MM`
      });
    }

    const dutyDate = new Date(date);
    const dayStart = new Date(dutyDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(dutyDate); dayEnd.setHours(23, 59, 59, 999);

    const driverConflict = await prisma.duty.findFirst({
      where: { driverId: parseInt(driverId), date: { gte: dayStart, lte: dayEnd } },
    });
    if (driverConflict) {
      return res.status(400).json({ message: 'This driver already has a duty on this date' });
    }

    const vehicleConflict = await prisma.duty.findFirst({
      where: { vehicleId: parseInt(vehicleId), date: { gte: dayStart, lte: dayEnd } },
    });
    if (vehicleConflict) {
      return res.status(400).json({ message: 'This vehicle is already assigned on this date' });
    }

    const duty = await prisma.duty.create({
      data: {
        date:      dutyDate,
        vehicleId: parseInt(vehicleId),
        driverId:  parseInt(driverId),
        routeId:   parseInt(routeId),
        startTime: startDT,
        endTime:   endDT,
        status:    'draft',
      },
      include: {
        driver:  { select: { fullName: true } },
        vehicle: { select: { regNo: true } },
        route:   { select: { name: true } },
      },
    });

    console.log('Duty created successfully:', duty.id);
    res.status(201).json({ message: 'Duty created', duty });
  } catch (err) {
    console.error('createDuty ERROR:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
}

async function publishDuty(req, res) {
  try {
    const id   = parseInt(req.params.id);
    const duty = await prisma.duty.findUnique({ where: { id } });
    if (!duty) return res.status(404).json({ message: 'Duty not found' });
    if (duty.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft duties can be published' });
    }
    const updated = await prisma.duty.update({ where: { id }, data: { status: 'published' } });
    res.json({ message: 'Duty published', duty: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

async function acknowledgeDuty(req, res) {
  try {
    const id   = parseInt(req.params.id);
    const duty = await prisma.duty.findUnique({ where: { id } });
    if (!duty) return res.status(404).json({ message: 'Duty not found' });
    if (duty.driverId !== req.user.id) return res.status(403).json({ message: 'Not your duty' });
    if (duty.status !== 'published') return res.status(400).json({ message: 'Duty must be published first' });
    const updated = await prisma.duty.update({
      where: { id },
      data:  { status: 'acknowledged', ackAt: new Date() },
    });
    res.json({ message: 'Duty acknowledged', duty: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

async function getDriversForDepot(req, res) {
  try {
    const depotId = req.depotFilter || parseInt(req.query.depotId);
    const drivers = await prisma.user.findMany({
      where:   { role: 'driver', ...(depotId ? { depotId } : {}) },
      select:  { id: true, fullName: true, phone: true },
      orderBy: { fullName: 'asc' },
    });
    res.json({ drivers });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

async function getRoutes(req, res) {
  try {
    const depotWhere = req.depotFilter ? { depotId: req.depotFilter } : {};
    const routes = await prisma.route.findMany({
      where:   depotWhere,
      select:  { id: true, code: true, name: true },
      orderBy: { code: 'asc' },
    });
    res.json({ routes });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getRoster, getMyDuty, createDuty, publishDuty, acknowledgeDuty, getDriversForDepot, getRoutes };