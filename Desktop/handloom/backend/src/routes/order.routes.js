const router = require('express').Router();
const { placeOrder, getBuyerOrders, getOrder, cancelOrder, trackOrder } = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.use(protect);
router.post('/', restrictTo('buyer'), placeOrder);
router.get('/', restrictTo('buyer'), getBuyerOrders);
router.get('/:id', getOrder);
router.get('/:id/track', trackOrder);
router.patch('/:id/cancel', restrictTo('buyer'), cancelOrder);

module.exports = router;
