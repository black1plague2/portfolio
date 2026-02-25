const mongoose = require('mongoose');

const weaverCapacitySchema = new mongoose.Schema(
  {
    weaverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    loomCount: { type: Number, required: true, min: 1 },
    loomTypes: [String],
    avgProductionPerDay: { type: Number, required: true },
    maxCapacityPerMonth: { type: Number, required: true },
    activeOrderQuantity: { type: Number, default: 0 },
    availableCapacity: { type: Number, default: 0 },
    downtimeDays: { type: Number, default: 0 },
    clusterManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    specializations: [
      {
        fabricType: String,
        weaveType: String,
        proficiencyLevel: {
          type: String,
          enum: ['beginner', 'intermediate', 'expert'],
        },
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

weaverCapacitySchema.methods.getAvailableCapacity = function () {
  return Math.max(0, this.maxCapacityPerMonth - this.activeOrderQuantity);
};

weaverCapacitySchema.pre('save', function (next) {
  this.availableCapacity = Math.max(0, this.maxCapacityPerMonth - this.activeOrderQuantity);
  next();
});

module.exports = mongoose.model('WeaverCapacity', weaverCapacitySchema);
