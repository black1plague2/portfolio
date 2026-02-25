const router = require('express').Router();
const { getDashboardStats, getAllWeavers, verifyWeaver, getAllOrders, overrideOrderStatus, getAllUsers, toggleUserStatus } = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.use(protect, restrictTo('admin'));
router.get('/stats', getDashboardStats);
router.get('/weavers', getAllWeavers);
router.patch('/weavers/:id/verify', verifyWeaver);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/override', overrideOrderStatus);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;
