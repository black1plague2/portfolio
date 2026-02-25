const User = require('../models/User');
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const Product = require('../models/Product');
const WeaverCapacity = require('../models/WeaverCapacity');
const { notifyUser } = require('../sockets');
const { catchAsync, sendSuccess, sendPaginated, AppError } = require('../utils/apiResponse');

// @GET /api/v1/admin/stats
const getDashboardStats = catchAsync(async (req, res) => {
  const [totalUsers, totalOrders, totalProducts, revenue] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
    ]),
  ]);

  const pendingKyc = await User.countDocuments({ kycStatus: 'submitted' });
  const platformRevenue = revenue[0]?.total || 0;

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Top weavers
  const topWeavers = await SubOrder.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$weaverId', totalEarnings: { $sum: '$subTotal' }, ordersCompleted: { $sum: 1 } } },
    { $sort: { totalEarnings: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'weaver' } },
    { $unwind: '$weaver' },
    { $project: { 'weaver.name': 1, 'weaver.region': 1, totalEarnings: 1, ordersCompleted: 1 } },
  ]);

  sendSuccess(res, 200, 'Dashboard stats', {
    totalUsers, totalOrders, totalProducts, platformRevenue, pendingKyc, ordersByStatus, topWeavers,
  });
});

// @GET /api/v1/admin/weavers
const getAllWeavers = catchAsync(async (req, res) => {
  const { kycStatus, verified, page = 1, limit = 20 } = req.query;
  const filter = { role: 'weaver' };
  if (kycStatus) filter.kycStatus = kycStatus;
  if (verified !== undefined) filter.verified = verified === 'true';

  const skip = (page - 1) * limit;
  const [weavers, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  sendPaginated(res, 'Weavers fetched', weavers, { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) });
});

// @PATCH /api/v1/admin/weavers/:id/verify
const verifyWeaver = catchAsync(async (req, res, next) => {
  const { action, note } = req.body;
  if (!['approve', 'reject'].includes(action)) return next(new AppError('Action must be approve or reject', 400));

  const user = await User.findOne({ _id: req.params.id, role: 'weaver' });
  if (!user) return next(new AppError('Weaver not found', 404));

  user.kycStatus = action === 'approve' ? 'approved' : 'rejected';
  user.verified = action === 'approve';
  await user.save({ validateBeforeSave: false });

  notifyUser(user._id.toString(), 'kyc_status_updated', {
    message: action === 'approve' ? 'Your KYC has been approved!' : 'Your KYC was rejected. Please contact support.',
    kycStatus: user.kycStatus,
  });

  sendSuccess(res, 200, `Weaver KYC ${action}d`, { user });
});

// @GET /api/v1/admin/orders
const getAllOrders = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('buyerId', 'name email')
      .populate('productId', 'title fabricType')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(filter),
  ]);
  sendPaginated(res, 'Orders fetched', orders, { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) });
});

// @PATCH /api/v1/admin/orders/:id/override
const overrideOrderStatus = catchAsync(async (req, res, next) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));

  order.status = status;
  await order.save();

  notifyUser(order.buyerId.toString(), 'order_status_overridden', {
    message: `Your order status has been updated to ${status} by admin.`,
    orderId: order._id,
    note,
  });

  sendSuccess(res, 200, 'Order status overridden', { order });
});

// @GET /api/v1/admin/users
const getAllUsers = catchAsync(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const filter = role ? { role } : {};

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  sendPaginated(res, 'Users fetched', users, { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) });
});

// @PATCH /api/v1/admin/users/:id/toggle-status
const toggleUserStatus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  sendSuccess(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'}`, { isActive: user.isActive });
});

module.exports = { getDashboardStats, getAllWeavers, verifyWeaver, getAllOrders, overrideOrderStatus, getAllUsers, toggleUserStatus };
