const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: { type: String, trim: true },
    attachments: [{ url: String, filename: String, mimeType: String }],
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
  },
  { timestamps: true }
);

messageSchema.index({ orderId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
