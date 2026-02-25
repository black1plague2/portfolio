const DesignRequest = require('../models/DesignRequest');
const { catchAsync, sendSuccess, AppError } = require('../utils/apiResponse');

// @POST /api/v1/designer/requests
const createRequest = catchAsync(async (req, res) => {
  const designFiles = req.files?.map((f) => f.location || `/uploads/${f.filename}`) || [];
  const request = await DesignRequest.create({
    ...req.body,
    designerId: req.user._id,
    designFiles,
  });
  sendSuccess(res, 201, 'Design request created', { request });
});

// @GET /api/v1/designer/requests
const getMyRequests = catchAsync(async (req, res) => {
  const requests = await DesignRequest.find({ designerId: req.user._id }).sort('-createdAt');
  sendSuccess(res, 200, 'Requests fetched', { requests });
});

// @GET /api/v1/designer/requests/:id
const getRequest = catchAsync(async (req, res, next) => {
  const request = await DesignRequest.findOne({ _id: req.params.id, designerId: req.user._id })
    .populate('quotes.weaverId', 'name rating region');
  if (!request) return next(new AppError('Design request not found', 404));
  sendSuccess(res, 200, 'Request fetched', { request });
});

// @PATCH /api/v1/designer/requests/:id/accept-quote
const acceptQuote = catchAsync(async (req, res, next) => {
  const { quoteId } = req.body;
  const request = await DesignRequest.findOne({ _id: req.params.id, designerId: req.user._id });
  if (!request) return next(new AppError('Design request not found', 404));

  const quote = request.quotes.id(quoteId);
  if (!quote) return next(new AppError('Quote not found', 404));

  request.acceptedQuoteId = quoteId;
  request.status = 'sample_in_progress';
  await request.save();

  sendSuccess(res, 200, 'Quote accepted', { request });
});

module.exports = { createRequest, getMyRequests, getRequest, acceptQuote };
