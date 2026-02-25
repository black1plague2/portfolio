/**
 * run:  node seed.js
 * Make sure MONGO_URI is set in backend/.env before running
 */
require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌  MONGO_URI not found in .env");
  process.exit(1);
}

// ── Pre-hashed bcryptjs hash of "Password@123" (12 rounds) ──
const PW = "$2b$12$6xtp27842bs7wN07Ls7mAOykFfVxQfzHNlHoDA4NH1kU2Mn7XaAJC";

const id = (hex) => new mongoose.Types.ObjectId(hex);

// ── IDs ──────────────────────────────────────────────────────
const ADMIN    = id("650000000000000000000001");
const W1       = id("650000000000000000000002"); // Rajesh  – Gujarat
const W2       = id("650000000000000000000003"); // Meera   – Varanasi
const W3       = id("650000000000000000000004"); // Arjun   – Kerala
const W4       = id("650000000000000000000005"); // Fatima  – Rajasthan
const B1       = id("650000000000000000000006"); // StyleHub
const B2       = id("650000000000000000000007"); // Ethnic Threads
const DESIGNER = id("650000000000000000000008"); // Priya
const CLUSTER  = id("650000000000000000000009"); // Cluster Head
const P1       = id("650000000000000000000101"); // Banarasi Silk
const P2       = id("650000000000000000000102"); // Chanderi
const P3       = id("650000000000000000000103"); // Kasavu
const P4       = id("650000000000000000000104"); // Ikat Dobby
const SO1      = id("650000000000000000000201"); // SubOrder 1
const SO2      = id("650000000000000000000202"); // SubOrder 2
const O1       = id("650000000000000000000301"); // Parent Order

// ── Schema-less collections via raw driver ───────────────────
async function seed() {
  await mongoose.connect(MONGO_URI, { dbName: 'handloom' });
  const db = mongoose.connection.db;
  console.log("✅  Connected to MongoDB:", db.databaseName);

  // Drop existing data
  const collections = ["users","weavercapacities","products","orders","suborders","messages","designrequests"];
  for (const col of collections) {
    await db.collection(col).drop().catch(() => {}); // ignore "ns not found"
  }
  console.log("🗑   Collections dropped");

  // Indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ role: 1, verified: 1 });
  await db.collection("products").createIndex({ fabricType: 1, weaveType: 1 });
  await db.collection("products").createIndex({ weaverId: 1 });
  await db.collection("products").createIndex({ isActive: 1 });
  await db.collection("orders").createIndex({ buyerId: 1, createdAt: -1 });
  await db.collection("orders").createIndex({ status: 1 });
  await db.collection("suborders").createIndex({ parentOrderId: 1 });
  await db.collection("suborders").createIndex({ weaverId: 1, status: 1 });
  await db.collection("messages").createIndex({ orderId: 1, createdAt: 1 });
  await db.collection("weavercapacities").createIndex({ weaverId: 1 }, { unique: true });
  console.log("📑  Indexes created");

  // Users
  await db.collection("users").insertMany([
    { _id: ADMIN,    name: "Admin User",             email: "admin@handloom.com",        passwordHash: PW, role: "admin",           phone: "9800000001", region: "Delhi",     rating: 5,   totalRatings: 0,  verified: true,  kycStatus: "approved", kycDocuments: [], isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { _id: W1,       name: "Rajesh Patel",            email: "rajesh@weaver.com",         passwordHash: PW, role: "weaver",          phone: "9800000002", region: "Gujarat",   rating: 4.7, totalRatings: 28, verified: true,  kycStatus: "approved", kycDocuments: [], isActive: true, address: { city: "Surat",    state: "Gujarat",       pincode: "395001", country: "India" }, createdAt: new Date(), updatedAt: new Date() },
    { _id: W2,       name: "Meera Devi",              email: "meera@weaver.com",          passwordHash: PW, role: "weaver",          phone: "9800000003", region: "Varanasi",  rating: 4.9, totalRatings: 52, verified: true,  kycStatus: "approved", kycDocuments: [], isActive: true, address: { city: "Varanasi", state: "Uttar Pradesh", pincode: "221001", country: "India" }, createdAt: new Date(), updatedAt: new Date() },
    { _id: W3,       name: "Arjun Krishnan",          email: "arjun@weaver.com",          passwordHash: PW, role: "weaver",          phone: "9800000004", region: "Kerala",    rating: 4.5, totalRatings: 17, verified: true,  kycStatus: "approved", kycDocuments: [], isActive: true, address: { city: "Thrissur", state: "Kerala",         pincode: "680001", country: "India" }, createdAt: new Date(), updatedAt: new Date() },
    { _id: W4,       name: "Fatima Khan",             email: "fatima@weaver.com",         passwordHash: PW, role: "weaver",          phone: "9800000005", region: "Rajasthan", rating: 4.3, totalRatings: 11, verified: false, kycStatus: "submitted", kycDocuments: ["kyc/doc1.pdf"], isActive: true, address: { city: "Jaipur",   state: "Rajasthan",     pincode: "302001", country: "India" }, createdAt: new Date(), updatedAt: new Date() },
    { _id: B1,       name: "StyleHub Boutique",       email: "buyer@stylehub.com",        passwordHash: PW, role: "buyer",           phone: "9800000006", region: "Mumbai",    rating: 0,   totalRatings: 0,  verified: true,  kycStatus: "approved", kycDocuments: [], isActive: true, address: { city: "Mumbai",   state: "Maharashtra",   pincode: "400001", country: "India" }, createdAt: new Date(), updatedAt: new Date() },
    { _id: B2,       name: "Ethnic Threads Co.",      email: "buyer@ethnicthreads.com",   passwordHash: PW, role: "buyer",           phone: "9800000007", region: "Bangalore", rating: 0,   totalRatings: 0,  verified: true,  kycStatus: "approved", kycDocuments: [], isActive: true, address: { city: "Bangalore",state: "Karnataka",     pincode: "560001", country: "India" }, createdAt: new Date(), updatedAt: new Date() },
    { _id: DESIGNER, name: "Priya Sharma",            email: "priya@designer.com",        passwordHash: PW, role: "designer",        phone: "9800000008", region: "Delhi",     rating: 0,   totalRatings: 0,  verified: true,  kycStatus: "approved", kycDocuments: [], isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { _id: CLUSTER,  name: "Cluster Head - Banaras", email: "cluster@banaras.com",       passwordHash: PW, role: "cluster_manager", phone: "9800000009", region: "Varanasi",  rating: 0,   totalRatings: 0,  verified: true,  kycStatus: "approved", kycDocuments: [], isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ]);
  console.log("👤  Users seeded (9)");

  // Weaver Capacities
  await db.collection("weavercapacities").insertMany([
    { weaverId: W1, loomCount: 8,  loomTypes: ["power loom","handloom"], avgProductionPerDay: 40, maxCapacityPerMonth: 1200, activeOrderQuantity: 200, availableCapacity: 1000, downtimeDays: 2, specializations: [{ fabricType:"silk",   weaveType:"jacquard", proficiencyLevel:"expert" },{ fabricType:"cotton", weaveType:"plain",    proficiencyLevel:"expert" }], lastUpdated: new Date(), createdAt: new Date(), updatedAt: new Date() },
    { weaverId: W2, loomCount: 12, loomTypes: ["handloom"],              avgProductionPerDay: 30, maxCapacityPerMonth: 900,  activeOrderQuantity: 100, availableCapacity: 800,  downtimeDays: 0, specializations: [{ fabricType:"silk",   weaveType:"plain",    proficiencyLevel:"expert" },{ fabricType:"silk",   weaveType:"twill",    proficiencyLevel:"expert" }], lastUpdated: new Date(), createdAt: new Date(), updatedAt: new Date() },
    { weaverId: W3, loomCount: 5,  loomTypes: ["handloom"],              avgProductionPerDay: 20, maxCapacityPerMonth: 600,  activeOrderQuantity: 50,  availableCapacity: 550,  downtimeDays: 1, specializations: [{ fabricType:"cotton", weaveType:"plain",    proficiencyLevel:"expert" }],                                                                                    lastUpdated: new Date(), createdAt: new Date(), updatedAt: new Date() },
  ]);
  console.log("🪡  Weaver capacities seeded (3)");

  // Products
  await db.collection("products").insertMany([
    { _id: P1, weaverId: W1, title: "Banarasi Pure Silk Saree Fabric",   description: "Premium Banarasi silk with gold zari work.",            fabricType: "silk",   weaveType: "jacquard", weavePattern: "floral zari",    pricePerUnit: 1200, currency: "INR", unit: "meters", moq: 50,  productionTimeDays: 14, stock: 500, images: ["products/banarasi-silk-1.jpg"], colorOptions: ["red","navy","gold"],           isActive: true, isFeatured: true,  tags: ["silk","banarasi","zari","bridal"], totalOrders: 24, rating: 4.8, createdAt: new Date(), updatedAt: new Date() },
    { _id: P2, weaverId: W2, title: "Handloom Chanderi Cotton-Silk",     description: "Lightweight Chanderi fabric with traditional butis.",    fabricType: "cotton", weaveType: "plain",    weavePattern: "buti",           pricePerUnit: 450,  currency: "INR", unit: "meters", moq: 100, productionTimeDays: 10, stock: 800, images: ["products/chanderi-1.jpg"],         colorOptions: ["white","ivory","pastel-pink"],  isActive: true, isFeatured: true,  tags: ["chanderi","cotton","lightweight"],  totalOrders: 38, rating: 4.9, createdAt: new Date(), updatedAt: new Date() },
    { _id: P3, weaverId: W3, title: "Kerala Kasavu Cotton Fabric",       description: "Traditional Kerala white cotton with kasavu border.",    fabricType: "cotton", weaveType: "plain",    weavePattern: "kasavu border",  pricePerUnit: 320,  currency: "INR", unit: "meters", moq: 50,  productionTimeDays: 7,  stock: 600, images: ["products/kasavu-1.jpg"],           colorOptions: ["white-gold","cream-gold"],      isActive: true, isFeatured: false, tags: ["kerala","kasavu","cotton"],         totalOrders: 12, rating: 4.5, createdAt: new Date(), updatedAt: new Date() },
    { _id: P4, weaverId: W1, title: "Ikat Cotton Dobby Fabric",          description: "Vibrant ikat-dyed cotton dobby weave.",                  fabricType: "cotton", weaveType: "dobby",    weavePattern: "ikat geometric", pricePerUnit: 380,  currency: "INR", unit: "meters", moq: 100, productionTimeDays: 12, stock: 400, images: ["products/ikat-1.jpg"],             colorOptions: ["indigo-white","rust-cream"],    isActive: true, isFeatured: false, tags: ["ikat","cotton","dobby"],            totalOrders: 9,  rating: 4.6, createdAt: new Date(), updatedAt: new Date() },
  ]);
  console.log("🧵  Products seeded (4)");

  // Sub-Orders (must be before parent order)
  await db.collection("suborders").insertMany([
    {
      _id: SO1, parentOrderId: O1, weaverId: W1, productId: P1,
      quantity: 150, allocatedCapacity: 150, unitPrice: 1200, subTotal: 180000,
      productionStage: "weaving",
      stageHistory: [
        { stage: "assigned",         updatedAt: new Date("2026-02-15"), note: "Auto-allocated" },
        { stage: "yarn_procurement", updatedAt: new Date("2026-02-16"), note: "Accepted" },
        { stage: "loom_setup",       updatedAt: new Date("2026-02-18"), note: "" },
        { stage: "weaving",          updatedAt: new Date("2026-02-20"), note: "In progress" },
      ],
      status: "in_progress", deadline: new Date("2026-03-05"),
      acceptedAt: new Date("2026-02-16"), createdAt: new Date("2026-02-15"), updatedAt: new Date(),
    },
    {
      _id: SO2, parentOrderId: O1, weaverId: W2, productId: P1,
      quantity: 100, allocatedCapacity: 100, unitPrice: 1200, subTotal: 120000,
      productionStage: "loom_setup",
      stageHistory: [
        { stage: "assigned",         updatedAt: new Date("2026-02-15"), note: "Auto-allocated" },
        { stage: "yarn_procurement", updatedAt: new Date("2026-02-17"), note: "Accepted" },
        { stage: "loom_setup",       updatedAt: new Date("2026-02-19"), note: "Setting up looms" },
      ],
      status: "in_progress", deadline: new Date("2026-03-05"),
      acceptedAt: new Date("2026-02-17"), createdAt: new Date("2026-02-15"), updatedAt: new Date(),
    },
  ]);
  console.log("📦  Sub-orders seeded (2)");

  // Parent Order
  await db.collection("orders").insertOne({
    _id: O1, buyerId: B1, productId: P1,
    totalQuantity: 250, unitPrice: 1200,
    totalAmount: 300000, commissionAmount: 24000,
    netPayableToWeavers: 276000, advancePaid: 90000, finalPaymentDue: 210000,
    status: "in_production", paymentStatus: "advance_paid",
    subOrders: [SO1, SO2],
    deliveryAddress: { street: "Fashion Street 88", city: "Mumbai", state: "Maharashtra", pincode: "400001", country: "India" },
    buyerNotes: "Need delivery before Diwali. Quality must be premium.",
    createdAt: new Date("2026-02-15"), updatedAt: new Date(),
  });
  console.log("🛒  Order seeded (1)");

  // Messages
  await db.collection("messages").insertMany([
    { orderId: O1, senderId: B1, receiverId: W1, message: "Hi Rajesh, can you confirm the delivery timeline?", attachments: [], isRead: true,  messageType: "text", createdAt: new Date("2026-02-15T10:00:00"), updatedAt: new Date() },
    { orderId: O1, senderId: W1, receiverId: B1, message: "Yes! Weaving started. Delivery by March 5.",        attachments: [], isRead: false, messageType: "text", createdAt: new Date("2026-02-16T09:30:00"), updatedAt: new Date() },
  ]);
  console.log("💬  Messages seeded (2)");

  // Design Request
  await db.collection("designrequests").insertOne({
    designerId: DESIGNER,
    title: "Custom Ikat Wedding Collection",
    description: "200 meters of custom ikat silk for wedding collection.",
    fabricType: "silk", weaveType: "ikat",
    colorPalette: ["deep-maroon", "gold", "ivory"],
    quantity: 200, status: "submitted",
    quotes: [{ weaverId: W1, pricePerUnit: 1800, productionDays: 21, note: "Can deliver premium quality in 3 weeks.", submittedAt: new Date() }],
    deadline: new Date("2026-04-01"),
    createdAt: new Date(), updatedAt: new Date(),
  });
  console.log("🎨  Design request seeded (1)");

  // Summary
  console.log("\n── Collection counts ──────────────────────");
  for (const col of collections) {
    const count = await db.collection(col).countDocuments();
    console.log(`  ${col.padEnd(20)} ${count}`);
  }

  console.log("\n✅  Seed complete!");
  console.log("   All passwords are: Password@123");
  console.log("   admin@handloom.com  |  rajesh@weaver.com  |  buyer@stylehub.com  |  priya@designer.com");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
