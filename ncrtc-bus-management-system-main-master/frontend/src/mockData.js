// Mock data for demo mode (no backend needed)

export const MOCK_USER_ADMIN = {
  id: 1, username: 'admin1', fullName: 'Rajesh Kumar',
  role: 'admin', depotId: null,
};

export const MOCK_VEHICLES = [
  { id: 1, regNo: 'DL 1P 0001', status: 'active', depot: { name: 'Noida Sector 52' } },
  { id: 2, regNo: 'DL 1P 0002', status: 'active', depot: { name: 'Noida Sector 52' } },
  { id: 3, regNo: 'UP 16 T 1234', status: 'active', depot: { name: 'Ghaziabad' } },
  { id: 4, regNo: 'UP 16 T 5678', status: 'maintenance', depot: { name: 'Ghaziabad' } },
  { id: 5, regNo: 'HR 26 BX 9901', status: 'active', depot: { name: 'Gurugram' } },
];

export const MOCK_LIVE_VEHICLES = [
  { vehicleId: 1, regNo: 'DL 1P 0001', lat: 28.6280, lng: 77.3649, speed: 42, lastSeen: new Date().toISOString(), driver: { fullName: 'Amit Singh' }, route: { name: 'NS52 → Noida Sec 51', code: 'R-101' } },
  { vehicleId: 2, regNo: 'DL 1P 0002', lat: 28.6100, lng: 77.3400, speed: 0,  lastSeen: new Date().toISOString(), driver: { fullName: 'Ravi Sharma' }, route: { name: 'NS52 → Botanical Garden', code: 'R-102' } },
  { vehicleId: 3, regNo: 'UP 16 T 1234', lat: 28.6600, lng: 77.4100, speed: 55, lastSeen: new Date().toISOString(), driver: { fullName: 'Deepak Yadav' }, route: { name: 'GZB → Vaishali', code: 'R-201' } },
  { vehicleId: 5, regNo: 'HR 26 BX 9901', lat: 28.4595, lng: 77.0266, speed: 30, lastSeen: new Date().toISOString(), driver: { fullName: 'Suresh Babu' }, route: { name: 'GGN → Huda City', code: 'R-301' } },
];

export const MOCK_DUTIES = [
  { id: 1, date: '2026-05-28', status: 'acknowledged', startTime: '06:00', endTime: '14:00', ackAt: new Date().toISOString(), driver: { id: 10, fullName: 'Amit Singh', phone: '9876543210' }, vehicle: { id: 1, regNo: 'DL 1P 0001' }, route: { id: 1, name: 'NS52 → Noida Sec 51', code: 'R-101' } },
  { id: 2, date: '2026-05-28', status: 'published', startTime: '14:00', endTime: '22:00', ackAt: null, driver: { id: 11, fullName: 'Ravi Sharma', phone: '9876500001' }, vehicle: { id: 2, regNo: 'DL 1P 0002' }, route: { id: 2, name: 'NS52 → Botanical Garden', code: 'R-102' } },
  { id: 3, date: '2026-05-28', status: 'draft', startTime: '22:00', endTime: '06:00', ackAt: null, driver: { id: 12, fullName: 'Deepak Yadav', phone: '9811223344' }, vehicle: { id: 3, regNo: 'UP 16 T 1234' }, route: { id: 3, name: 'GZB → Vaishali', code: 'R-201' } },
  { id: 4, date: '2026-05-28', status: 'published', startTime: '06:00', endTime: '14:00', ackAt: null, driver: { id: 13, fullName: 'Suresh Babu', phone: '9900112233' }, vehicle: { id: 5, regNo: 'HR 26 BX 9901' }, route: { id: 4, name: 'GGN → Huda City', code: 'R-301' } },
];

export const MOCK_MY_DUTY = {
  id: 2, status: 'published', startTime: '14:00', endTime: '22:00', ackAt: null,
  vehicle: { regNo: 'DL 1P 0002' },
  route: {
    name: 'NS52 → Botanical Garden', code: 'R-102',
    stops: [
      { sequence: 1, plannedOffsetMin: 0, stop: { name: 'Noida Sector 52 RRTS', lat: 28.628, lng: 77.365 } },
      { sequence: 2, plannedOffsetMin: 8, stop: { name: 'Sector 50 Market', lat: 28.621, lng: 77.358 } },
      { sequence: 3, plannedOffsetMin: 15, stop: { name: 'DPS School Gate', lat: 28.614, lng: 77.350 } },
      { sequence: 4, plannedOffsetMin: 22, stop: { name: 'Botanical Garden', lat: 28.607, lng: 77.340 } },
    ],
  },
};

export const MOCK_INCIDENTS = [
  { id: 1, type: 'breakdown', severity: 'P1', status: 'open', description: 'Engine failure on NH-24 near Vaishali flyover. Bus stopped completely.', createdAt: new Date(Date.now() - 3600000).toISOString(), resolvedAt: null, raisedBy: { fullName: 'Deepak Yadav', role: 'driver' }, assignedTo: null, vehicle: { regNo: 'UP 16 T 1234' } },
  { id: 2, type: 'accident', severity: 'P2', status: 'in_progress', description: 'Minor collision with auto-rickshaw at Sector 50 intersection. No injuries.', createdAt: new Date(Date.now() - 7200000).toISOString(), resolvedAt: null, raisedBy: { fullName: 'Ravi Sharma', role: 'driver' }, assignedTo: { fullName: 'Manager Verma' }, vehicle: { regNo: 'DL 1P 0002' } },
  { id: 3, type: 'breakdown', severity: 'P3', status: 'resolved', description: 'Tyre puncture. Replaced by standby crew.', createdAt: new Date(Date.now() - 86400000).toISOString(), resolvedAt: new Date(Date.now() - 82800000).toISOString(), raisedBy: { fullName: 'Amit Singh', role: 'driver' }, assignedTo: { fullName: 'Rakesh Verma' }, vehicle: { regNo: 'DL 1P 0001' } },
  { id: 4, type: 'emergency', severity: 'P1', status: 'acknowledged', description: 'Passenger medical emergency. Ambulance called.', createdAt: new Date(Date.now() - 1800000).toISOString(), resolvedAt: null, raisedBy: { fullName: 'Suresh Babu', role: 'driver' }, assignedTo: { fullName: 'Ops Team' }, vehicle: { regNo: 'HR 26 BX 9901' } },
  { id: 5, type: 'other', severity: 'P3', status: 'closed', description: 'Route deviation reported by passengers. Driver corrected route.', createdAt: new Date(Date.now() - 172800000).toISOString(), resolvedAt: new Date(Date.now() - 170000000).toISOString(), raisedBy: { fullName: 'Control Room', role: 'control_operator' }, assignedTo: { fullName: 'Amit Singh' }, vehicle: { regNo: 'DL 1P 0001' } },
];

export const MOCK_INCIDENT_DETAIL = {
  ...MOCK_INCIDENTS[0],
  events: [
    { ts: new Date(Date.now() - 3600000).toISOString(), fromStatus: null, toStatus: 'open', note: 'Incident raised — engine seized on NH-24', actor: { fullName: 'Deepak Yadav', role: 'driver' } },
    { ts: new Date(Date.now() - 3400000).toISOString(), fromStatus: 'open', toStatus: 'acknowledged', note: 'Mechanic team dispatched from Ghaziabad depot', actor: { fullName: 'Rakesh Verma', role: 'depot_manager' } },
  ],
};

export const MOCK_NOTICES = [
  { id: 1, title: 'Route Change: R-101 Diversion from 1 June', body: 'Due to NHAI construction work on NH-24, Route R-101 will be diverted via Sector 53 service road from 1st June 2026. Please follow the updated route map shared on the depot notice board. This diversion is expected to last 45 days.', audience: 'role:driver', publishAt: new Date(Date.now() - 86400000).toISOString(), createdBy: 'admin1', isRead: true, readAt: new Date(Date.now() - 80000000).toISOString() },
  { id: 2, title: 'Mandatory Safety Training — 30 May 2026', body: 'All drivers are required to attend the safety refresher training on 30th May 2026 at 10:00 AM at the Noida Sector 52 depot hall. Attendance is compulsory. Bring your employee ID card. Duration: 3 hours.', audience: 'all', publishAt: new Date(Date.now() - 43200000).toISOString(), createdBy: 'admin1', isRead: false, readAt: null },
  { id: 3, title: 'New Panic Button Protocol', body: 'From today, use of the panic button will automatically alert the nearest police station in addition to the control room. A follow-up call from the control room will come within 2 minutes. Do NOT press the panic button for non-emergencies.', audience: 'role:driver', publishAt: new Date(Date.now() - 7200000).toISOString(), createdBy: 'admin1', isRead: false, readAt: null },
];
