// src/routes/incident.route.js
const router                        = require('express').Router();
const auth                          = require('../middleware/auth.middleware');
const { allowRoles, sameDepotOnly } = require('../middleware/role.middleware');
const ctrl                          = require('../controllers/incident.controller');

// IMPORTANT: /panic must come BEFORE /:id
router.post('/panic', auth, allowRoles('driver'), ctrl.panicButton);

router.get('/',      auth, sameDepotOnly, ctrl.getIncidents);
router.get('/:id',   auth, ctrl.getIncidentById);
router.post('/',     auth, ctrl.createIncident);
router.patch('/:id/status', auth, allowRoles('admin', 'depot_manager', 'control_operator'), ctrl.updateStatus);
router.patch('/:id/assign', auth, allowRoles('admin', 'depot_manager', 'control_operator'), ctrl.assignIncident);

module.exports = router;
