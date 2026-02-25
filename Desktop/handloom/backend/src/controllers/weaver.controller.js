const SubOrder = require('../models/SubOrder');
const Order = require('../models/Order');
const WeaverCapacity = require('../models/WeaverCapacity');
const User = require('../models/User');
const { releaseCapacity } = require('../services/allocation.service');
const { notifyUser, notifyOrderRoom } = require('../sockets');
const { catchAsync, sendSuccess, sendPaginated, AppError } = require('../utils/apiResponse');

// @GET /api/v1/weaver/sub-orders
const getMySubOrders = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { weaverId: req.user._id };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [subOrders, total] = await Promise.all([
    SubOrder.find(filter)
      .populate('parentOrderId', 'buyerId totalAmount status')
      .populate('productId', 'title fabricType weaveType images')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    SubOrder.countDocuments(filter),
  ]);

  sendPaginated(res, 'Sub-orders fetched', subOrders, { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) });
});

// @PATCH /api/v1/weaver/sub-orders/:id/accept
const acceptSubOrder = catchAsync(async (req, res, next) => {
  const subOrder = await SubOrder.findOne({ _id: req.params.id, weaverId: req.user._id });
  if (!subOrder) return next(new AppError('Sub-order not found', 404));
  if (subOrder.status !== 'pending_acceptance') return next(new AppError('Sub-order already processed', 400));

  subOrder.status = 'accepted';
  subOrder.acceptedAt = new Date();
  subOrder.productionStage = 'yarn_procurement';
  subOrder.stageHistory.push({ stage: 'yarn_procurement', note: 'Accepted by weaver' });
  await subOrder.save();

  const parentOrder = await Order.findById(subOrder.parentOrderId);
  notifyUser(parentOrder.buyerId.toString(), 'sub_order_accepted', {
    message: 'Your sub-order has been accepted by weaver',
    subOrderId: subOrder._id,
    parentOrderId: subOrder.parentOrderId,
  });

  sendSuccess(res, 200, 'Sub-order accepted', { subOrder });
});

// @PATCH /api/v1/weaver/sub-orders/:id/reject
const rejectSubOrder = catchAsync(async (req, res, next) => {
  const subOrder = await SubOrder.findOne({ _id: req.params.id, weaverId: req.user._id });
  if (!subOrder) return next(new AppError('Sub-order not found', 404));
  if (subOrder.status !== 'pending_acceptance') return next(new AppError('Sub-order already processed', 400));

  subOrder.status = 'rejected';
  await subOrder.save();

  await releaseCapacity(req.user._id, subOrder.quantity);

  sendSuccess(res, 200, 'Sub-order rejected');
});

// @PATCH /api/v1/weaver/sub-orders/:id/stage
const updateProductionStage = catchAsync(async (req, res, next) => {
  const { stage, note } = req.body;
  const validStages = ['yarn_procurement', 'loom_setup', 'weaving', 'finishing', 'quality_check', 'ready_to_ship'];

  if (!validStages.includes(stage)) return next(new AppError('Invalid production stage', 400));

  const subOrder = await SubOrder.findOne({ _id: req.params.id, weaverId: req.user._id });
  if (!subOrder) return next(new AppError('Sub-order not found', 404));
  if (!['accepted', 'in_progress'].includes(subOrder.status)) return next(new AppError('Cannot update stage at current status', 400));

  subOrder.productionStage = stage;
  subOrder.status = 'in_progress';
  subOrder.stageHistory.push({ stage, note: note || '', updatedAt: new Date() });

  if (stage === 'ready_to_ship') {
    subOrder.completedAt = new Date();
    subOrder.status = 'completed';
    await releaseCapacity(req.user._id, subOrder.quantity);
  }
  await subOrder.save();

  const parentOrder = await Order.findById(subOrder.parentOrderId);

  // Notify buyer and order room
  notifyUser(parentOrder.buyerId.toString(), 'production_stage_updated', {
    message: `Production stage updated: ${stage}`,
    subOrderId: subOrder._id,
    stage,
  });
  notifyOrderRoom(subOrder.parentOrderId.toString(), 'production_stage_updated', { subOrderId: subOrder._id, stage });

  // Check if all sub-orders complete → update parent order
  const allSubOrders = await SubOrder.find({ parentOrderId: subOrder.parentOrderId });
  const allComplete = allSubOrders.every((s) => s.status === 'completed');
  if (allComplete) {
    parentOrder.status = 'ready_to_ship';
    await parentOrder.save();
    notifyUser(parentOrder.buyerId.toString(), 'order_ready_to_ship', { orderId: parentOrder._id });
  }

  sendSuccess(res, 200, 'Production stage updated', { subOrder });
});

// @GET /api/v1/weaver/capacity
const getMyCapacity = catchAsync(async (req, res) => {
  const capacity = await WeaverCapacity.findOne({ weaverId: req.user._id });
  sendSuccess(res, 200, 'Capacity fetched', { capacity });
});

// @POST /api/v1/weaver/capacity
const setCapacity = catchAsync(async (req, res) => {
  const capacity = await WeaverCapacity.findOneAndUpdate(
    { weaverId: req.user._id },
    { ...req.body, weaverId: req.user._id },
    { upsert: true, new: true, runValidators: true }
  );
  sendSuccess(res, 200, 'Capacity updated', { capacity });
});

// @GET /api/v1/weaver/earnings
const getEarnings = catchAsync(async (req, res) => {
  const subOrders = await SubOrder.find({ weaverId: req.user._id, status: 'completed' })
    .select('subTotal completedAt createdAt')
    .sort('-completedAt');

  const totalEarnings = subOrders.reduce((sum, s) => sum + s.subTotal, 0);
  const commissionRate = Number(process.env.PLATFORM_COMMISSION_RATE) || 0.08;
  const netEarnings = totalEarnings * (1 - commissionRate);

  // Monthly breakdown
  const monthly = {};
  subOrders.forEach((so) => {
    const key = so.completedAt ? `${so.completedAt.getFullYear()}-${so.completedAt.getMonth() + 1}` : 'unknown';
    monthly[key] = (monthly[key] || 0) + so.subTotal;
  });

  sendSuccess(res, 200, 'Earnings fetched', { totalEarnings, netEarnings, monthly, orders: subOrders.length });
});

module.exports = { getMySubOrders, acceptSubOrder, rejectSubOrder, updateProductionStage, getMyCapacity, setCapacity, getEarnings };
