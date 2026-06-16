// src/routes/avls.route.js
const router            = require('express').Router();
const auth              = require('../middleware/auth.middleware');
const { sameDepotOnly } = require('../middleware/role.middleware');
const ctrl              = require('../controllers/avls.controller');

router.get('/live',                       auth, sameDepotOnly, ctrl.getLiveMap);
router.get('/vehicles',                   auth, sameDepotOnly, ctrl.getVehicleList);
router.get('/history/:vehicleId',         auth, ctrl.getVehicleHistory);
router.get('/vehicle/:vehicleId/recent',  auth, ctrl.getRecentPings);
router.post('/ping',                      ctrl.insertPing); // no auth — called by tick.js

module.exports = router;
