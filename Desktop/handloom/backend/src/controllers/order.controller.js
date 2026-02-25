const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const Product = require('../models/Product');
const Shipment = require('../models/Shipment');
const { allocateOrder, releaseCapacity } = require('../services/allocation.service');
const { notifyUser, notifyOrderRoom } = require('../sockets');
const { catchAsync, sendSuccess, sendPaginated, AppError } = require('../utils/apiResponse');

// @POST /api/v1/orders  —  Buyer places bulk order
const placeOrder = catchAsync(async (req, res, next) => {
  const { productId, quantity, deliveryAddress, buyerNotes } = req.body;
  const buyerId = req.user._id;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) return next(new AppError('Product not found or inactive', 404));
  if (quantity < product.moq) return next(new AppError(`Minimum order quantity is ${product.moq}`, 400));

  const totalAmount = quantity * product.pricePerUnit;
  const commissionRate = Number(process.env.PLATFORM_COMMISSION_RATE) || 0.08;
  const commissionAmount = totalAmount * commissionRate;
  const netPayableToWeavers = totalAmount - commissionAmount;
  const advancePaid = totalAmount * (Number(process.env.ADVANCE_PAYMENT_RATE) || 0.3);

  // Create parent order
  const order = await Order.create({
    buyerId,
    productId,
    totalQuantity: quantity,
    unitPrice: product.pricePerUnit,
    totalAmount,
    commissionAmount,
    netPayableToWeavers,
    advancePaid,
    finalPaymentDue: totalAmount - advancePaid,
    status: 'pending',
    paymentStatus: 'unpaid',
    deliveryAddress,
    buyerNotes,
  });

  // Allocate sub-orders via Allocation Service
  const subOrders = await allocateOrder({
    parentOrderId: order._id,
    productId: product._id,
    totalQuantity: quantity,
    unitPrice: product.pricePerUnit,
    fabricType: product.fabricType,
    weaveType: product.weaveType,
    region: req.user.region,
    productionTimeDays: product.productionTimeDays,
  });

  // Link sub-orders to parent
  order.subOrders = subOrders.map((s) => s._id);
  order.status = 'confirmed';
  await order.save();

  // Real-time: notify each weaver about their sub-order
  for (const so of subOrders) {
    notifyUser(so.weaverId.toString(), 'sub_order_assigned', {
      message: 'New sub-order assigned to you',
      subOrderId: so._id,
      parentOrderId: order._id,
      quantity: so.quantity,
    });
  }

  sendSuccess(res, 201, 'Order placed and allocated successfully', {
    order,
    subOrders,
    allocationSummary: {
      totalQuantity: quantity,
      allocatedAcross: subOrders.length,
      weavers: subOrders.map((s) => ({ weaverId: s.weaverId, quantity: s.quantity })),
    },
  });
});

// @GET /api/v1/orders  —  Buyer's orders
const getBuyerOrders = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { buyerId: req.user._id };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('productId', 'title fabricType images')
      .populate({ path: 'subOrders', populate: { path: 'weaverId', select: 'name rating region' } })
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  sendPaginated(res, 'Orders fetched', orders, { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) });
});

// @GET /api/v1/orders/:id
const getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('productId', 'title images fabricType weaveType')
    .populate({ path: 'subOrders', populate: { path: 'weaverId', select: 'name rating region phone' } })
    .populate('shipmentId');

  if (!order) return next(new AppError('Order not found', 404));

  // Access control: buyer can see their own orders; admin can see all
  if (req.user.role !== 'admin' && order.buyerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  sendSuccess(res, 200, 'Order fetched', { order });
});

// @PATCH /api/v1/orders/:id/cancel
const cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, buyerId: req.user._id });
  if (!order) return next(new AppError('Order not found', 404));

  if (!['pending', 'confirmed'].includes(order.status)) {
    return next(new AppError('Order cannot be cancelled at this stage', 400));
  }

  // Release capacity for each sub-order
  const subOrders = await SubOrder.find({ parentOrderId: order._id });
  for (const so of subOrders) {
    await releaseCapacity(so.weaverId, so.quantity);
    so.status = 'cancelled';
    await so.save();
  }

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || 'Cancelled by buyer';
  await order.save();

  sendSuccess(res, 200, 'Order cancelled successfully', { order });
});

// @GET /api/v1/orders/:id/track
const trackOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate({
      path: 'subOrders',
      select: 'weaverId quantity productionStage stageHistory status deadline',
      populate: { path: 'weaverId', select: 'name region' },
    })
    .populate('shipmentId');

  if (!order) return next(new AppError('Order not found', 404));

  const progress = order.subOrders.map((so) => ({
    subOrderId: so._id,
    weaver: so.weaverId?.name,
    quantity: so.quantity,
    currentStage: so.productionStage,
    status: so.status,
    deadline: so.deadline,
    history: so.stageHistory,
  }));

  sendSuccess(res, 200, 'Order tracking', { orderId: order._id, overallStatus: order.status, progress, shipment: order.shipmentId });
});

module.exports = { placeOrder, getBuyerOrders, getOrder, cancelOrder, trackOrder };
