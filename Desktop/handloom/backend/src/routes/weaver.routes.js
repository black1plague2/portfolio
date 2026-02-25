const router = require('express').Router();
const { getMySubOrders, acceptSubOrder, rejectSubOrder, updateProductionStage, getMyCapacity, setCapacity, getEarnings } = require('../controllers/weaver.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.use(protect, restrictTo('weaver', 'cluster_manager'));
router.get('/sub-orders', getMySubOrders);
router.patch('/sub-orders/:id/accept', acceptSubOrder);
router.patch('/sub-orders/:id/reject', rejectSubOrder);
router.patch('/sub-orders/:id/stage', updateProductionStage);
router.get('/capacity', getMyCapacity);
router.post('/capacity', setCapacity);
router.get('/earnings', getEarnings);

module.exports = router;
