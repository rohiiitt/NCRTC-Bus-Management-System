// src/controllers/vehicle.controller.js

const prisma = require('../lib/prisma');

// GET /vehicles
async function getAllVehicles(req, res) {
  try {
    const depotWhere = req.depotFilter ? { depotId: req.depotFilter } : {};

    const vehicles = await prisma.vehicle.findMany({
      where:   depotWhere,
      include: { depot: { select: { name: true, code: true } } },
      orderBy: { regNo: 'asc' },
    });

    res.json({ vehicles });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /vehicles
async function createVehicle(req, res) {
  try {
    const { regNo, depotId, status } = req.body;

    if (!regNo || !depotId) {
      return res.status(400).json({ message: 'regNo and depotId are required' });
    }

    const vehicle = await prisma.vehicle.create({
      data: { regNo, depotId: parseInt(depotId), status: status || 'active' },
    });

    res.status(201).json({ message: 'Vehicle created', vehicle });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Registration number already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
}

// PATCH /vehicles/:id
async function updateVehicle(req, res) {
  try {
    const { status } = req.body;
    const updated = await prisma.vehicle.update({
      where: { id: parseInt(req.params.id) },
      data:  { status },
    });
    res.json({ message: 'Vehicle updated', vehicle: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /depots  — list all depots (used in dropdowns)
async function getDepots(req, res) {
  try {
    const depots = await prisma.depot.findMany({
      select: { id: true, code: true, name: true, locationLat: true, locationLng: true },
      orderBy: { name: 'asc' },
    });
    res.json({ depots });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getAllVehicles, createVehicle, updateVehicle, getDepots };
