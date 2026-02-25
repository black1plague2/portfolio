const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema(
  {
    parentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    subOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubOrder' }],
    courier: { type: String, trim: true },
    trackingNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'packed', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'returned'],
      default: 'pending',
    },
    trackingHistory: [
      {
        status: String,
        location: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    dispatchDate: { type: Date },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shipment', shipmentSchema);
