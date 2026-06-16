// src/routes/notice.route.js
const router         = require('express').Router();
const auth           = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const ctrl           = require('../controllers/notice.controller');

router.get('/',                 auth, ctrl.getNotices);
router.post('/',                auth, allowRoles('admin'), ctrl.createNotice);
router.get('/:id',              auth, ctrl.getNoticeById);
router.post('/:id/read',        auth, ctrl.markRead);
router.get('/:id/receipts',     auth, allowRoles('admin'), ctrl.getReadReceipts);

module.exports = router;
