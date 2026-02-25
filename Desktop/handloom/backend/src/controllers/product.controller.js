const Product = require('../models/Product');
const { catchAsync, sendSuccess, sendPaginated, AppError } = require('../utils/apiResponse');

// @GET /api/v1/products - public browse
const getProducts = catchAsync(async (req, res) => {
  const { fabricType, weaveType, minPrice, maxPrice, region, page = 1, limit = 20, sort = '-createdAt' } = req.query;

  const filter = { isActive: true };
  if (fabricType) filter.fabricType = fabricType;
  if (weaveType) filter.weaveType = weaveType;
  if (minPrice || maxPrice) {
    filter.pricePerUnit = {};
    if (minPrice) filter.pricePerUnit.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerUnit.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('weaverId', 'name rating region verified')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  sendPaginated(res, 'Products fetched', products, {
    total,
    page: Number(page),
    limit: Number(limit),
    pages: Math.ceil(total / Number(limit)),
  });
});

// @GET /api/v1/products/:id
const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('weaverId', 'name rating region verified phone');
  if (!product) return next(new AppError('Product not found', 404));
  sendSuccess(res, 200, 'Product fetched', { product });
});

// @POST /api/v1/products
const createProduct = catchAsync(async (req, res) => {
  // S3 returns f.location; disk storage returns f.filename
  const images = req.files?.map((f) => f.location || `/uploads/${f.filename}`) || [];
  const product = await Product.create({
    ...req.body,
    weaverId: req.user._id,
    images,
  });
  sendSuccess(res, 201, 'Product created', { product });
});

// @PUT /api/v1/products/:id
const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, weaverId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!product) return next(new AppError('Product not found or unauthorized', 404));
  sendSuccess(res, 200, 'Product updated', { product });
});

// @DELETE /api/v1/products/:id
const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, weaverId: req.user._id },
    { isActive: false },
    { new: true }
  );
  if (!product) return next(new AppError('Product not found or unauthorized', 404));
  sendSuccess(res, 200, 'Product deactivated');
});

// @GET /api/v1/products/my - weaver's own products
const getMyProducts = catchAsync(async (req, res) => {
  const products = await Product.find({ weaverId: req.user._id, isActive: true }).sort('-createdAt');
  sendSuccess(res, 200, 'Products fetched', { products });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getMyProducts };
