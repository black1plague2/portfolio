const mongoose = require('mongoose');

const productionStages = [
  'assigned',
  'yarn_procurement',
  'loom_setup',
  'weaving',
  'finishing',
  'quality_check',
  'ready_to_ship',
  'shipped',
];

const subOrderSchema = new mongoose.Schema(
  {
    parentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    weaverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: { type: Number, required: true, min: 1 },
    allocatedCapacity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    subTotal: { type: Number, required: true },
    productionStage: {
      type: String,
      enum: productionStages,
      default: 'assigned',
    },
    stageHistory: [
      {
        stage: { type: String, enum: productionStages },
        updatedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending_acceptance', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
      default: 'pending_acceptance',
    },
    deadline: { type: Date, required: true },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    weaverNotes: { type: String },
    qcPassed: { type: Boolean },
    qcNotes: { type: String },
  },
  { timestamps: true }
);

subOrderSchema.index({ parentOrderId: 1 });
subOrderSchema.index({ weaverId: 1, status: 1 });

module.exports = mongoose.model('SubOrder', subOrderSchema);
