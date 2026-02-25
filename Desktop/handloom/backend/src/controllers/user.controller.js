const User = require('../models/User');
const { catchAsync, sendSuccess, AppError } = require('../utils/apiResponse');

// @GET /api/v1/users/profile
const getProfile = catchAsync(async (req, res) => {
  sendSuccess(res, 200, 'Profile fetched', { user: req.user });
});

// @PATCH /api/v1/users/profile
const updateProfile = catchAsync(async (req, res) => {
  const allowedFields = ['name', 'phone', 'region', 'address'];
  const updates = {};
  allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  if (req.file) updates.avatar = req.file.location;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  sendSuccess(res, 200, 'Profile updated', { user });
});

// @POST /api/v1/users/kyc
const submitKyc = catchAsync(async (req, res) => {
  const documents = req.files?.map((f) => f.location) || [];
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { kycDocuments: documents, kycStatus: 'submitted' },
    { new: true }
  );
  sendSuccess(res, 200, 'KYC documents submitted for review', { kycStatus: user.kycStatus });
});

// @PATCH /api/v1/users/change-password
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+passwordHash');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return next(new AppError('Current password is incorrect', 400));

  user.passwordHash = newPassword;
  await user.save();

  sendSuccess(res, 200, 'Password changed successfully');
});

module.exports = { getProfile, updateProfile, submitKyc, changePassword };
