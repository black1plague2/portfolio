const mongoose = require('mongoose');

const designRequestSchema = new mongoose.Schema(
  {
    designerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    fabricType: { type: String },
    weaveType: { type: String },
    colorPalette: [String],
    patterns: [String],
    quantity: { type: Number, min: 1 },
    designFiles: [String],
    sampleImages: [String],
    status: {
      type: String,
      enum: ['draft', 'submitted', 'quoted', 'sample_in_progress', 'sample_ready', 'approved', 'in_production', 'completed', 'cancelled'],
      default: 'draft',
    },
    quotes: [
      {
        weaverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        pricePerUnit: Number,
        productionDays: Number,
        note: String,
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    acceptedQuoteId: { type: mongoose.Schema.Types.ObjectId },
    linkedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    deadline: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DesignRequest', designRequestSchema);
