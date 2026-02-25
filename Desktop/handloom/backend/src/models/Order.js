const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    totalQuantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    commissionAmount: { type: Number, default: 0 },
    netPayableToWeavers: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_production', 'quality_check', 'ready_to_ship', 'shipped', 'delivered', 'cancelled', 'disputed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'advance_paid', 'fully_paid', 'refunded'],
      default: 'unpaid',
    },
    advancePaid: { type: Number, default: 0 },
    finalPaymentDue: { type: Number, default: 0 },
    subOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubOrder' }],
    shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    buyerNotes: { type: String },
    expectedDeliveryDate: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
    disputeReason: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
