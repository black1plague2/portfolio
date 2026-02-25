const User = require('../models/User');
const WeaverCapacity = require('../models/WeaverCapacity');
const SubOrder = require('../models/SubOrder');
const { AppError } = require('../utils/apiResponse');

/**
 * Allocation Service
 * Intelligently distributes bulk orders across eligible weavers
 * based on capacity, rating, and production speed.
 */

/**
 * Fetch eligible weavers for a given product & quantity
 * @param {string} fabricType
 * @param {string} weaveType
 * @param {string} region - optional, preferred region
 * @returns {Array} sorted list of eligible weavers with capacity info
 */
const fetchEligibleWeavers = async (fabricType, weaveType, region = null) => {
  const userQuery = {
    role: 'weaver',
    verified: true,
    isActive: true,
    kycStatus: 'approved',
  };

  const weavers = await User.find(userQuery).lean();
  const weaverIds = weavers.map((w) => w._id);

  let capacityQuery = {
    weaverId: { $in: weaverIds },
    availableCapacity: { $gt: 0 },
  };

  if (fabricType || weaveType) {
    capacityQuery['specializations'] = {
      $elemMatch: {
        ...(fabricType && { fabricType }),
        ...(weaveType && { weaveType }),
      },
    };
  }

  const capacities = await WeaverCapacity.find(capacityQuery).populate('weaverId', 'name rating region').lean();

  // Enrich & filter
  let eligible = capacities
    .filter((cap) => cap.availableCapacity > 0)
    .map((cap) => ({
      weaverId: cap.weaverId._id,
      name: cap.weaverId.name,
      rating: cap.weaverId.rating,
      region: cap.weaverId.region,
      availableCapacity: cap.availableCapacity,
      avgProductionPerDay: cap.avgProductionPerDay,
      capacityDocId: cap._id,
    }));

  // Prefer region match, then sort by: capacity DESC, rating DESC, production speed DESC
  eligible.sort((a, b) => {
    const regionScoreA = region && a.region === region ? 1 : 0;
    const regionScoreB = region && b.region === region ? 1 : 0;
    if (regionScoreB !== regionScoreA) return regionScoreB - regionScoreA;
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.availableCapacity !== a.availableCapacity) return b.availableCapacity - a.availableCapacity;
    return b.avgProductionPerDay - a.avgProductionPerDay;
  });

  return eligible;
};

/**
 * Allocate order quantity across eligible weavers
 * @param {ObjectId} parentOrderId
 * @param {ObjectId} productId
 * @param {number} totalQuantity
 * @param {number} unitPrice
 * @param {string} fabricType
 * @param {string} weaveType
 * @param {string} region
 * @param {number} productionTimeDays
 * @returns {Array<SubOrder>} created sub-orders
 */
const allocateOrder = async ({
  parentOrderId,
  productId,
  totalQuantity,
  unitPrice,
  fabricType,
  weaveType,
  region,
  productionTimeDays,
}) => {
  const eligibleWeavers = await fetchEligibleWeavers(fabricType, weaveType, region);

  if (eligibleWeavers.length === 0) {
    throw new AppError('No eligible weavers available for this order at this time.', 400);
  }

  let remaining = totalQuantity;
  const subOrdersData = [];

  for (const weaver of eligibleWeavers) {
    if (remaining <= 0) break;

    const allocate = Math.min(remaining, weaver.availableCapacity);
    if (allocate <= 0) continue;

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + productionTimeDays + 2);

    subOrdersData.push({
      parentOrderId,
      weaverId: weaver.weaverId,
      productId,
      quantity: allocate,
      allocatedCapacity: allocate,
      unitPrice,
      subTotal: allocate * unitPrice,
      deadline,
      status: 'pending_acceptance',
      productionStage: 'assigned',
      stageHistory: [{ stage: 'assigned', updatedAt: new Date(), note: 'Auto-allocated by system' }],
    });

    remaining -= allocate;
  }

  if (remaining > 0) {
    throw new AppError(
      `Insufficient capacity. ${remaining} units could not be allocated. Available capacity is less than the order quantity.`,
      400
    );
  }

  // Create sub-orders in DB
  const createdSubOrders = await SubOrder.insertMany(subOrdersData);

  // Update weaver active capacities
  const updatePromises = subOrdersData.map(async (so) => {
    await WeaverCapacity.findOneAndUpdate(
      { weaverId: so.weaverId },
      { $inc: { activeOrderQuantity: so.quantity } },
      { new: true }
    ).then(async (cap) => {
      cap.availableCapacity = Math.max(0, cap.maxCapacityPerMonth - cap.activeOrderQuantity);
      await cap.save();
    });
  });

  await Promise.all(updatePromises);

  return createdSubOrders;
};

/**
 * Release capacity when a sub-order is completed or cancelled
 * @param {ObjectId} weaverId
 * @param {number} quantity
 */
const releaseCapacity = async (weaverId, quantity) => {
  await WeaverCapacity.findOneAndUpdate(
    { weaverId },
    { $inc: { activeOrderQuantity: -quantity } }
  ).then(async (cap) => {
    if (cap) {
      cap.availableCapacity = Math.max(0, cap.maxCapacityPerMonth - cap.activeOrderQuantity);
      await cap.save();
    }
  });
};

module.exports = { allocateOrder, fetchEligibleWeavers, releaseCapacity };
