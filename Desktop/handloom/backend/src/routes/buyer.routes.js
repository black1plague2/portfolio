const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');

// Buyer-specific dashboard aggregated data can go here
// For now, buyer order routes are in order.routes.js
router.use(protect, restrictTo('buyer'));

router.get('/dashboard', async (req, res) => {
  const Order = require('../models/Order');
  const orders = await Order.find({ buyerId: req.user._id }).sort('-createdAt').limit(5)
    .populate('productId', 'title images');
  const stats = await Order.aggregate([
    { $match: { buyerId: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } },
  ]);
  res.json({ success: true, message: 'Buyer dashboard', data: { recentOrders: orders, stats } });
});

module.exports = router;
