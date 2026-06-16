// src/routes/vehicle.route.js
const router                        = require('express').Router();
const auth                          = require('../middleware/auth.middleware');
const { allowRoles, sameDepotOnly } = require('../middleware/role.middleware');
const ctrl                          = require('../controllers/vehicle.controller');

router.get('/depots', auth, ctrl.getDepots);
router.get('/',       auth, sameDepotOnly, ctrl.getAllVehicles);
router.post('/',      auth, allowRoles('admin'), ctrl.createVehicle);
router.patch('/:id',  auth, allowRoles('admin', 'depot_manager'), ctrl.updateVehicle);

module.exports = router;
