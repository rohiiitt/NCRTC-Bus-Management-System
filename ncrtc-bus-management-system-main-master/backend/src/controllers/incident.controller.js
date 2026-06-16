// src/controllers/incident.controller.js
// IMS = Incident Management System

const prisma = require('../lib/prisma');

// State machine — valid transitions only
const TRANSITIONS = {
  open:         ['acknowledged'],
  acknowledged: ['in_progress'],
  in_progress:  ['resolved'],
  resolved:     ['closed'],
};

// GET /incidents?status=open&severity=P1&type=breakdown
async function getIncidents(req, res) {
  try {
    const { status, severity, type } = req.query;

    const incidents = await prisma.incident.findMany({
      where: {
        ...(status   ? { status }   : {}),
        ...(severity ? { severity } : {}),
        ...(type     ? { type }     : {}),
        ...(req.depotFilter ? { depotId: req.depotFilter } : {}),
      },
      include: {
        raisedBy:   { select: { fullName: true, role: true } },
        assignedTo: { select: { fullName: true } },
        vehicle:    { select: { regNo: true } },
        depot:      { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ incidents, count: incidents.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /incidents/:id — full detail with event timeline
async function getIncidentById(req, res) {
  try {
    const incident = await prisma.incident.findUnique({
      where:   { id: parseInt(req.params.id) },
      include: {
        raisedBy:   { select: { fullName: true, role: true } },
        assignedTo: { select: { fullName: true } },
        vehicle:    { select: { regNo: true } },
        depot:      { select: { name: true } },
        events: {
          include: { actor: { select: { fullName: true, role: true } } },
          orderBy: { ts: 'asc' },
        },
      },
    });

    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    res.json({ incident });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /incidents
async function createIncident(req, res) {
  try {
    const { type, severity, description, vehicleId, depotId } = req.body;

    if (!type || !severity || !description) {
      return res.status(400).json({ message: 'type, severity and description are required' });
    }

    // Admin has no depotId — use first depot as fallback
    let resolvedDepotId = req.user.depotId;
    if (!resolvedDepotId) {
      const firstDepot = await prisma.depot.findFirst();
      resolvedDepotId = firstDepot?.id;
    }

    if (!resolvedDepotId) {
      return res.status(400).json({ message: 'No depot found in system' });
    }

    const incident = await prisma.incident.create({
      data: {
        type,
        severity,
        description,
        vehicleId:  vehicleId ? parseInt(vehicleId) : null,
        depotId:    resolvedDepotId,
        raisedById: req.user.id,
        status:     'open',
      },
    });

    await prisma.incidentEvent.create({
      data: {
        incidentId: incident.id,
        actorId:    req.user.id,
        fromStatus: 'open',
        toStatus:   'open',
        note:       'Incident created',
      },
    });

    res.status(201).json({ message: 'Incident raised', incident });
  } catch (err) {
    console.error('createIncident error:', err);
    res.status(500).json({ message: err.message });
  }
}

// POST /incidents/panic
// Driver's one-tap emergency button — creates P1 automatically
async function panicButton(req, res) {
  try {
    const today = new Date();
    const start = new Date(today); start.setHours(0, 0, 0, 0);
    const end   = new Date(today); end.setHours(23, 59, 59, 999);

    // Find driver's vehicle from today's duty
    const duty = await prisma.duty.findFirst({
      where: { driverId: req.user.id, date: { gte: start, lte: end } },
    });

    const incident = await prisma.incident.create({
      data: {
        type:        'breakdown',
        severity:    'P1',
        description: `PANIC BUTTON activated by ${req.user.id}. Immediate assistance required.`,
        vehicleId:   duty?.vehicleId || null,
        depotId: req.user.depotId || (await prisma.depot.findFirst())?.id,
        raisedById:  req.user.id,
        status:      'open',
      },
    });

    await prisma.incidentEvent.create({
      data: {
        incidentId: incident.id,
        actorId:    req.user.id,
        fromStatus: 'open',
        toStatus:   'open',
        note:       'P1 raised via PANIC BUTTON',
      },
    });

    res.status(201).json({ message: 'P1 Emergency incident raised. Help is on the way.', incident });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// PATCH /incidents/:id/status
// Moves incident through state machine with mandatory note
async function updateStatus(req, res) {
  try {
    const { status, note } = req.body;
    const incidentId = parseInt(req.params.id);

    if (!status || !note) {
      return res.status(400).json({ message: 'Both status and note are required' });
    }

    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    const allowed = TRANSITIONS[incident.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Cannot move from "${incident.status}" to "${status}". Allowed next: ${allowed.join(', ') || 'none (already final)'}`,
      });
    }

    // Transaction: update incident + create event atomically
    const [updatedIncident] = await prisma.$transaction([
      prisma.incident.update({
        where: { id: incidentId },
        data: {
          status,
          resolvedAt: status === 'resolved' ? new Date() : undefined,
        },
      }),
      prisma.incidentEvent.create({
        data: { incidentId, actorId: req.user.id, fromStatus: incident.status, toStatus: status, note },
      }),
    ]);

    res.json({ message: 'Status updated', incident: updatedIncident });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// PATCH /incidents/:id/assign
async function assignIncident(req, res) {
  try {
    const { assignedToId } = req.body;

    if (!assignedToId) {
      return res.status(400).json({ message: 'assignedToId is required' });
    }

    const updated = await prisma.incident.update({
      where:   { id: parseInt(req.params.id) },
      data:    { assignedToId: parseInt(assignedToId) },
      include: { assignedTo: { select: { fullName: true } } },
    });

    res.json({ message: `Incident assigned to ${updated.assignedTo?.fullName}`, incident: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getIncidents, getIncidentById, createIncident, panicButton, updateStatus, assignIncident };
