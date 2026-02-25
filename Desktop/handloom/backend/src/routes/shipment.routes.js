const router = require('express').Router();
const { createShipment, getShipment, updateTracking } = require('../controllers/shipment.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

router.use(protect);
router.post('/', restrictTo('admin'), createShipment);
router.get('/:id', getShipment);
router.patch('/:id/track', restrictTo('admin'), updateTracking);

module.exports = router;
