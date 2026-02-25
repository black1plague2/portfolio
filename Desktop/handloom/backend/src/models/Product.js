const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    weaverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Product title required'],
      trim: true,
      maxlength: 200,
    },
    description: { type: String, trim: true },
    fabricType: {
      type: String,
      required: true,
      enum: ['silk', 'cotton', 'wool', 'linen', 'jute', 'synthetic', 'blended', 'other'],
    },
    weaveType: {
      type: String,
      required: true,
      enum: ['plain', 'twill', 'satin', 'jacquard', 'dobby', 'tapestry', 'ikat', 'other'],
    },
    weavePattern: { type: String },
    pricePerUnit: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    unit: { type: String, default: 'meters', enum: ['meters', 'yards', 'pieces', 'kg'] },
    moq: { type: Number, default: 50, min: 1 },
    productionTimeDays: { type: Number, required: true, min: 1 },
    stock: { type: Number, default: 0, min: 0 },
    images: [String],
    colorOptions: [String],
    dimensions: {
      width: Number,
      length: Number,
    },
    weight: Number,
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    tags: [String],
    totalOrders: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

productSchema.index({ fabricType: 1, weaveType: 1 });
productSchema.index({ weaverId: 1 });
productSchema.index({ pricePerUnit: 1 });

module.exports = mongoose.model('Product', productSchema);
