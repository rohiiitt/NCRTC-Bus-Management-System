// src/routes/duty.route.js
const router                        = require('express').Router();
const auth                          = require('../middleware/auth.middleware');
const { allowRoles, sameDepotOnly } = require('../middleware/role.middleware');
const ctrl                          = require('../controllers/duty.controller');

// IMPORTANT: /my and /drivers must come BEFORE /:id routes
router.get('/my',      auth, allowRoles('driver'), ctrl.getMyDuty);
router.get('/drivers', auth, sameDepotOnly, ctrl.getDriversForDepot);
router.get('/routes',  auth, sameDepotOnly, ctrl.getRoutes);

router.get('/',                  auth, sameDepotOnly, ctrl.getRoster);
router.post('/',                 auth, allowRoles('admin', 'depot_manager'), ctrl.createDuty);
router.patch('/:id/publish',     auth, allowRoles('admin', 'depot_manager'), ctrl.publishDuty);
router.patch('/:id/acknowledge', auth, allowRoles('driver'), ctrl.acknowledgeDuty);

module.exports = router;
