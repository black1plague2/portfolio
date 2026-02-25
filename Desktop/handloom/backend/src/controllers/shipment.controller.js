const Shipment = require('../models/Shipment');
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const { notifyUser } = require('../sockets');
const { catchAsync, sendSuccess, AppError } = require('../utils/apiResponse');

// @POST /api/v1/shipments  —  Admin creates shipment after all sub-orders complete
const createShipment = catchAsync(async (req, res, next) => {
  const { parentOrderId, courier, trackingNumber, estimatedDelivery, deliveryAddress } = req.body;

  const order = await Order.findById(parentOrderId);
  if (!order) return next(new AppError('Order not found', 404));
  if (order.status !== 'ready_to_ship') return next(new AppError('Order is not ready to ship', 400));

  const subOrders = await SubOrder.find({ parentOrderId, status: 'completed' });

  const shipment = await Shipment.create({
    parentOrderId,
    subOrders: subOrders.map((s) => s._id),
    courier,
    trackingNumber,
    estimatedDelivery,
    deliveryAddress: deliveryAddress || order.deliveryAddress,
    status: 'dispatched',
    dispatchDate: new Date(),
    trackingHistory: [{ status: 'dispatched', timestamp: new Date(), note: 'Shipment created' }],
  });

  order.shipmentId = shipment._id;
  order.status = 'shipped';
  await order.save();

  notifyUser(order.buyerId.toString(), 'order_shipped', {
    message: 'Your order has been shipped!',
    orderId: order._id,
    trackingNumber,
    courier,
  });

  sendSuccess(res, 201, 'Shipment created', { shipment });
});

// @GET /api/v1/shipments/:id
const getShipment = catchAsync(async (req, res, next) => {
  const shipment = await Shipment.findById(req.params.id)
    .populate('parentOrderId', 'buyerId totalAmount status')
    .populate('subOrders', 'weaverId quantity status');
  if (!shipment) return next(new AppError('Shipment not found', 404));
  sendSuccess(res, 200, 'Shipment fetched', { shipment });
});

// @PATCH /api/v1/shipments/:id/track
const updateTracking = catchAsync(async (req, res, next) => {
  const { status, location, note } = req.body;
  const shipment = await Shipment.findByIdAndUpdate(
    req.params.id,
    {
      status,
      $push: { trackingHistory: { status, location, note, timestamp: new Date() } },
      ...(status === 'delivered' && { actualDelivery: new Date() }),
    },
    { new: true }
  );
  if (!shipment) return next(new AppError('Shipment not found', 404));

  const order = await Order.findById(shipment.parentOrderId);
  if (status === 'delivered' && order) {
    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();
    notifyUser(order.buyerId.toString(), 'order_delivered', { orderId: order._id, message: 'Your order has been delivered!' });
  }

  sendSuccess(res, 200, 'Tracking updated', { shipment });
});

module.exports = { createShipment, getShipment, updateTracking };
