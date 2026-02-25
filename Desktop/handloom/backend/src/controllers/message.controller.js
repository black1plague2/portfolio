const Message = require('../models/Message');
const Order = require('../models/Order');
const { notifyUser } = require('../sockets');
const { catchAsync, sendSuccess, AppError } = require('../utils/apiResponse');

// @POST /api/v1/messages
const sendMessage = catchAsync(async (req, res, next) => {
  const { orderId, receiverId, message } = req.body;
  const attachments = req.files?.map((f) => ({ url: f.location, filename: f.originalname, mimeType: f.mimetype })) || [];

  const order = await Order.findById(orderId);
  if (!order) return next(new AppError('Order not found', 404));

  const msg = await Message.create({
    orderId,
    senderId: req.user._id,
    receiverId,
    message,
    attachments,
  });

  await msg.populate('senderId', 'name avatar role');

  notifyUser(receiverId, 'new_message', {
    message: 'New message received',
    data: msg,
    orderId,
  });

  sendSuccess(res, 201, 'Message sent', { message: msg });
});

// @GET /api/v1/messages/:orderId
const getMessages = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) return next(new AppError('Order not found', 404));

  const messages = await Message.find({ orderId })
    .populate('senderId', 'name avatar role')
    .sort('createdAt');

  // Mark as read
  await Message.updateMany(
    { orderId, receiverId: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  sendSuccess(res, 200, 'Messages fetched', { messages });
});

module.exports = { sendMessage, getMessages };
