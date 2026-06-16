// src/routes/auth.route.js
const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const ctrl   = require('../controllers/auth.controller');

router.post('/login', ctrl.loginUser);
router.get('/me',     auth, ctrl.getMe);

module.exports = router;
