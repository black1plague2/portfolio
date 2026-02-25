// ============================================================
// 🧵 HANDLOOM B2B MARKETPLACE — MongoDB Playground
// HOW TO USE:
//   Select ONLY one section at a time → right-click → "Run Selection"
//   Do NOT run the whole file at once (memory limit)
// ============================================================

// ── SECTION 1: Switch database ──────────────────────────────

use("handloom");


// ── SECTION 2: Drop collections (reset) ─────────────────────
// Select these lines and run:
use("handloom");
db.users.drop();
db.weavercapacities.drop();
db.products.drop();
db.orders.drop();
db.suborders.drop();
db.messages.drop();
db.designrequests.drop();


// ── SECTION 3: Create indexes ────────────────────────────────
use("handloom");
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1, verified: 1 });
db.products.createIndex({ fabricType: 1, weaveType: 1 });
db.products.createIndex({ weaverId: 1 });
db.products.createIndex({ isActive: 1 });
db.orders.createIndex({ buyerId: 1, createdAt: -1 });
db.orders.createIndex({ status: 1 });
db.suborders.createIndex({ parentOrderId: 1 });
db.suborders.createIndex({ weaverId: 1, status: 1 });
db.messages.createIndex({ orderId: 1, createdAt: 1 });
db.weavercapacities.createIndex({ weaverId: 1 }, { unique: true });


// ── SECTION 4a: Seed admin + weavers ────────────────────────
use("handloom");
const PW = "$2a$12$KIXaBrCeFWLvBRjKjBv9MuCsTJEbQGdxJiVGRBZMpfNWNqJEoS0Se";
db.users.insertMany([
  {
    _id: ObjectId("650000000000000000000001"),
    name: "Admin User", email: "admin@handloom.com",
    passwordHash: PW, role: "admin",
    phone: "9800000001", region: "Delhi",
    rating: 5, totalRatings: 0,
    verified: true, kycStatus: "approved", kycDocuments: [],
    isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    _id: ObjectId("650000000000000000000002"),
    name: "Rajesh Patel", email: "rajesh@weaver.com",
    passwordHash: PW, role: "weaver",
    phone: "9800000002", region: "Gujarat",
    address: { city: "Surat", state: "Gujarat", pincode: "395001", country: "India" },
    rating: 4.7, totalRatings: 28,
    verified: true, kycStatus: "approved", kycDocuments: [],
    isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    _id: ObjectId("650000000000000000000003"),
    name: "Meera Devi", email: "meera@weaver.com",
    passwordHash: PW, role: "weaver",
    phone: "9800000003", region: "Varanasi",
    address: { city: "Varanasi", state: "Uttar Pradesh", pincode: "221001", country: "India" },
    rating: 4.9, totalRatings: 52,
    verified: true, kycStatus: "approved", kycDocuments: [],
    isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    _id: ObjectId("650000000000000000000004"),
    name: "Arjun Krishnan", email: "arjun@weaver.com",
    passwordHash: PW, role: "weaver",
    phone: "9800000004", region: "Kerala",
    address: { city: "Thrissur", state: "Kerala", pincode: "680001", country: "India" },
    rating: 4.5, totalRatings: 17,
    verified: true, kycStatus: "approved", kycDocuments: [],
    isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    _id: ObjectId("650000000000000000000005"),
    name: "Fatima Khan", email: "fatima@weaver.com",
    passwordHash: PW, role: "weaver",
    phone: "9800000005", region: "Rajasthan",
    address: { city: "Jaipur", state: "Rajasthan", pincode: "302001", country: "India" },
    rating: 4.3, totalRatings: 11,
    verified: false, kycStatus: "submitted", kycDocuments: ["kyc/doc1.pdf"],
    isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
]);


// ── SECTION 4b: Seed buyers + designer + cluster manager ────
use("handloom");
const PW2 = "$2a$12$KIXaBrCeFWLvBRjKjBv9MuCsTJEbQGdxJiVGRBZMpfNWNqJEoS0Se";
db.users.insertMany([
  {
    _id: ObjectId("650000000000000000000006"),
    name: "StyleHub Boutique", email: "buyer@stylehub.com",
    passwordHash: PW2, role: "buyer",
    phone: "9800000006", region: "Mumbai",
    address: { city: "Mumbai", state: "Maharashtra", pincode: "400001", country: "India" },
    rating: 0, totalRatings: 0,
    verified: true, kycStatus: "approved",
    isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    _id: ObjectId("650000000000000000000007"),
    name: "Ethnic Threads Co.", email: "buyer@ethnicthreads.com",
    passwordHash: PW2, role: "buyer",
    phone: "9800000007", region: "Bangalore",
    address: { city: "Bangalore", state: "Karnataka", pincode: "560001", country: "India" },
    rating: 0, totalRatings: 0,
    verified: true, kycStatus: "approved",
    isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    _id: ObjectId("650000000000000000000008"),
    name: "Priya Sharma", email: "priya@designer.com",
    passwordHash: PW2, role: "designer",
    phone: "9800000008", region: "Delhi",
    rating: 0, totalRatings: 0,
    verified: true, kycStatus: "approved",
    isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    _id: ObjectId("650000000000000000000009"),
    name: "Cluster Head - Banaras", email: "cluster@banaras.com",
    passwordHash: PW2, role: "cluster_manager",
    phone: "9800000009", region: "Varanasi",
    rating: 0, totalRatings: 0,
    verified: true, kycStatus: "approved",
    isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
]);


// ── SECTION 5: Seed weaver capacities ───────────────────────
use("handloom");
db.weavercapacities.insertMany([
  {
    weaverId: ObjectId("650000000000000000000002"),
    loomCount: 8, loomTypes: ["power loom", "handloom"],
    avgProductionPerDay: 40, maxCapacityPerMonth: 1200,
    activeOrderQuantity: 200, availableCapacity: 1000, downtimeDays: 2,
    specializations: [
      { fabricType: "silk", weaveType: "jacquard", proficiencyLevel: "expert" },
      { fabricType: "cotton", weaveType: "plain", proficiencyLevel: "expert" },
    ],
    lastUpdated: new Date(), createdAt: new Date(), updatedAt: new Date(),
  },
  {
    weaverId: ObjectId("650000000000000000000003"),
    loomCount: 12, loomTypes: ["handloom"],
    avgProductionPerDay: 30, maxCapacityPerMonth: 900,
    activeOrderQuantity: 100, availableCapacity: 800, downtimeDays: 0,
    specializations: [
      { fabricType: "silk", weaveType: "plain", proficiencyLevel: "expert" },
      { fabricType: "silk", weaveType: "twill", proficiencyLevel: "expert" },
    ],
    lastUpdated: new Date(), createdAt: new Date(), updatedAt: new Date(),
  },
  {
    weaverId: ObjectId("650000000000000000000004"),
    loomCount: 5, loomTypes: ["handloom"],
    avgProductionPerDay: 20, maxCapacityPerMonth: 600,
    activeOrderQuantity: 50, availableCapacity: 550, downtimeDays: 1,
    specializations: [
      { fabricType: "cotton", weaveType: "plain", proficiencyLevel: "expert" },
    ],
    lastUpdated: new Date(), createdAt: new Date(), updatedAt: new Date(),
  },
]);


// ── SECTION 6: Seed products ─────────────────────────────────
use("handloom");
db.products.insertMany([
  {
    _id: ObjectId("650000000000000000000101"),
    weaverId: ObjectId("650000000000000000000002"),
    title: "Banarasi Pure Silk Saree Fabric",
    description: "Premium Banarasi silk with gold zari work.",
    fabricType: "silk", weaveType: "jacquard", weavePattern: "floral zari",
    pricePerUnit: 1200, currency: "INR", unit: "meters",
    moq: 50, productionTimeDays: 14, stock: 500,
    images: ["products/banarasi-silk-1.jpg"],
    colorOptions: ["red", "navy", "gold"],
    isActive: true, isFeatured: true,
    tags: ["silk", "banarasi", "zari", "bridal"],
    totalOrders: 24, rating: 4.8,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    _id: ObjectId("650000000000000000000102"),
    weaverId: ObjectId("650000000000000000000003"),
    title: "Handloom Chanderi Cotton-Silk",
    description: "Lightweight Chanderi fabric with traditional butis.",
    fabricType: "cotton", weaveType: "plain", weavePattern: "buti",
    pricePerUnit: 450, currency: "INR", unit: "meters",
    moq: 100, productionTimeDays: 10, stock: 800,
    images: ["products/chanderi-1.jpg"],
    colorOptions: ["white", "ivory", "pastel-pink"],
    isActive: true, isFeatured: true,
    tags: ["chanderi", "cotton", "lightweight"],
    totalOrders: 38, rating: 4.9,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    _id: ObjectId("650000000000000000000103"),
    weaverId: ObjectId("650000000000000000000004"),
    title: "Kerala Kasavu Cotton Fabric",
    description: "Traditional Kerala white cotton with golden kasavu border.",
    fabricType: "cotton", weaveType: "plain", weavePattern: "kasavu border",
    pricePerUnit: 320, currency: "INR", unit: "meters",
    moq: 50, productionTimeDays: 7, stock: 600,
    images: ["products/kasavu-1.jpg"],
    colorOptions: ["white-gold", "cream-gold"],
    isActive: true, isFeatured: false,
    tags: ["kerala", "kasavu", "cotton"],
    totalOrders: 12, rating: 4.5,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    _id: ObjectId("650000000000000000000104"),
    weaverId: ObjectId("650000000000000000000002"),
    title: "Ikat Cotton Dobby Fabric",
    description: "Vibrant ikat-dyed cotton dobby weave.",
    fabricType: "cotton", weaveType: "dobby", weavePattern: "ikat geometric",
    pricePerUnit: 380, currency: "INR", unit: "meters",
    moq: 100, productionTimeDays: 12, stock: 400,
    images: ["products/ikat-1.jpg"],
    colorOptions: ["indigo-white", "rust-cream"],
    isActive: true, isFeatured: false,
    tags: ["ikat", "cotton", "dobby"],
    totalOrders: 9, rating: 4.6,
    createdAt: new Date(), updatedAt: new Date(),
  },
]);


// ── SECTION 7: Seed sub-orders ───────────────────────────────
use("handloom");
db.suborders.insertMany([
  {
    _id: ObjectId("650000000000000000000201"),
    parentOrderId: ObjectId("650000000000000000000301"),
    weaverId: ObjectId("650000000000000000000002"),
    productId: ObjectId("650000000000000000000101"),
    quantity: 150, allocatedCapacity: 150,
    unitPrice: 1200, subTotal: 180000,
    productionStage: "weaving",
    stageHistory: [
      { stage: "assigned", updatedAt: new Date("2026-02-15"), note: "Auto-allocated" },
      { stage: "yarn_procurement", updatedAt: new Date("2026-02-16"), note: "Accepted" },
      { stage: "loom_setup", updatedAt: new Date("2026-02-18"), note: "" },
      { stage: "weaving", updatedAt: new Date("2026-02-20"), note: "In progress" },
    ],
    status: "in_progress",
    deadline: new Date("2026-03-05"),
    acceptedAt: new Date("2026-02-16"),
    createdAt: new Date("2026-02-15"), updatedAt: new Date(),
  },
  {
    _id: ObjectId("650000000000000000000202"),
    parentOrderId: ObjectId("650000000000000000000301"),
    weaverId: ObjectId("650000000000000000000003"),
    productId: ObjectId("650000000000000000000101"),
    quantity: 100, allocatedCapacity: 100,
    unitPrice: 1200, subTotal: 120000,
    productionStage: "loom_setup",
    stageHistory: [
      { stage: "assigned", updatedAt: new Date("2026-02-15"), note: "Auto-allocated" },
      { stage: "yarn_procurement", updatedAt: new Date("2026-02-17"), note: "Accepted" },
      { stage: "loom_setup", updatedAt: new Date("2026-02-19"), note: "Setting up looms" },
    ],
    status: "in_progress",
    deadline: new Date("2026-03-05"),
    acceptedAt: new Date("2026-02-17"),
    createdAt: new Date("2026-02-15"), updatedAt: new Date(),
  },
]);


// ── SECTION 8: Seed parent order ────────────────────────────
use("handloom");
db.orders.insertOne({
  _id: ObjectId("650000000000000000000301"),
  buyerId: ObjectId("650000000000000000000006"),
  productId: ObjectId("650000000000000000000101"),
  totalQuantity: 250, unitPrice: 1200,
  totalAmount: 300000, commissionAmount: 24000,
  netPayableToWeavers: 276000,
  advancePaid: 90000, finalPaymentDue: 210000,
  status: "in_production", paymentStatus: "advance_paid",
  subOrders: [
    ObjectId("650000000000000000000201"),
    ObjectId("650000000000000000000202"),
  ],
  deliveryAddress: {
    street: "Fashion Street 88", city: "Mumbai",
    state: "Maharashtra", pincode: "400001", country: "India",
  },
  buyerNotes: "Need delivery before Diwali. Quality must be premium.",
  createdAt: new Date("2026-02-15"), updatedAt: new Date(),
});


// ── SECTION 9: Seed messages + design request ───────────────
use("handloom");
db.messages.insertMany([
  {
    orderId: ObjectId("650000000000000000000301"),
    senderId: ObjectId("650000000000000000000006"),
    receiverId: ObjectId("650000000000000000000002"),
    message: "Hi Rajesh, can you confirm the delivery timeline?",
    attachments: [], isRead: true, messageType: "text",
    createdAt: new Date("2026-02-15T10:00:00"), updatedAt: new Date(),
  },
  {
    orderId: ObjectId("650000000000000000000301"),
    senderId: ObjectId("650000000000000000000002"),
    receiverId: ObjectId("650000000000000000000006"),
    message: "Yes! Weaving started. Delivery by March 5.",
    attachments: [], isRead: false, messageType: "text",
    createdAt: new Date("2026-02-16T09:30:00"), updatedAt: new Date(),
  },
]);
db.designrequests.insertOne({
  designerId: ObjectId("650000000000000000000008"),
  title: "Custom Ikat Wedding Collection",
  description: "200 meters of custom ikat silk for wedding collection.",
  fabricType: "silk", weaveType: "ikat",
  colorPalette: ["deep-maroon", "gold", "ivory"],
  quantity: 200, status: "submitted",
  quotes: [{
    weaverId: ObjectId("650000000000000000000002"),
    pricePerUnit: 1800, productionDays: 21,
    note: "Can deliver premium quality in 3 weeks.",
    submittedAt: new Date(),
  }],
  deadline: new Date("2026-04-01"),
  createdAt: new Date(), updatedAt: new Date(),
});


// ── SECTION 10: Verify counts ────────────────────────────────
use("handloom");
[
  ["users",            db.users.countDocuments()],
  ["weavercapacities", db.weavercapacities.countDocuments()],
  ["products",         db.products.countDocuments()],
  ["orders",           db.orders.countDocuments()],
  ["suborders",        db.suborders.countDocuments()],
  ["messages",         db.messages.countDocuments()],
  ["designrequests",   db.designrequests.countDocuments()],
].forEach(([col, count]) => print(`  ${col.padEnd(18)} ${count}`));


// ── SECTION 11: Useful queries (uncomment one at a time) ─────
use("handloom");

// Verified weavers with capacity
// db.users.aggregate([
//   { $match: { role: "weaver", verified: true } },
//   { $lookup: { from: "weavercapacities", localField: "_id", foreignField: "weaverId", as: "cap" } },
//   { $unwind: "$cap" },
//   { $project: { name:1, region:1, rating:1, "cap.availableCapacity":1 } },
//   { $sort: { rating: -1 } }
// ]);

// Order with sub-orders
// db.orders.aggregate([
//   { $match: { _id: ObjectId("650000000000000000000301") } },
//   { $lookup: { from: "suborders", localField: "subOrders", foreignField: "_id", as: "subs" } },
// ]);

// Platform revenue by month
// db.orders.aggregate([
//   { $match: { status: { $nin: ["cancelled"] } } },
//   { $group: { _id: { $month: "$createdAt" }, revenue: { $sum: "$totalAmount" }, commission: { $sum: "$commissionAmount" }, count: { $sum: 1 } } },
//   { $sort: { _id: 1 } }
// ]);

// Allocation simulation: eligible silk weavers
// db.weavercapacities.aggregate([
//   { $match: { availableCapacity: { $gt: 0 }, "specializations.fabricType": "silk" } },
//   { $lookup: { from: "users", localField: "weaverId", foreignField: "_id", as: "weaver" } },
//   { $unwind: "$weaver" },
//   { $match: { "weaver.verified": true } },
//   { $project: { "weaver.name":1, "weaver.rating":1, "weaver.region":1, availableCapacity:1, avgProductionPerDay:1 } },
//   { $sort: { "weaver.rating": -1, availableCapacity: -1 } }
// ]);

// Pending KYC weavers
// db.users.find({ role: "weaver", kycStatus: "submitted" }, { name:1, email:1, phone:1, region:1 });


// Users
