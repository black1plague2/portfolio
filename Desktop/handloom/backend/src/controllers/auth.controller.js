const User = require('../models/User');
const { catchAsync, sendSuccess, AppError } = require('../utils/apiResponse');
const { generateAccessToken, generateRefreshToken, setAuthCookies, clearAuthCookies } = require('../utils/jwt.util');
const jwt = require('jsonwebtoken');

// @POST /api/v1/auth/register
const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role, phone, region } = req.body;

  const allowed = ['weaver', 'buyer', 'designer', 'cluster_manager'];
  if (!allowed.includes(role)) {
    return next(new AppError('Invalid role for registration.', 400));
  }

  const existing = await User.findOne({ email });
  if (existing) return next(new AppError('Email already registered.', 409));

  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role,
    phone,
    region,
  });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  setAuthCookies(res, accessToken, refreshToken);

  sendSuccess(res, 201, 'Registration successful', {
    user: user.toPublicJSON(),
    accessToken,
  });
});

// @POST /api/v1/auth/login
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError('Email and password required.', 400));

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) return next(new AppError('Invalid credentials.', 401));

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return next(new AppError('Invalid credentials.', 401));

  if (!user.isActive) return next(new AppError('Account deactivated.', 403));

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  setAuthCookies(res, accessToken, refreshToken);

  sendSuccess(res, 200, 'Login successful', {
    user: user.toPublicJSON(),
    accessToken,
  });
});

// @POST /api/v1/auth/refresh
const refresh = catchAsync(async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) return next(new AppError('Refresh token missing.', 401));

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) return next(new AppError('Invalid refresh token.', 401));

  const accessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  setAuthCookies(res, accessToken, newRefreshToken);

  sendSuccess(res, 200, 'Token refreshed', { accessToken });
});

// @POST /api/v1/auth/logout
const logout = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });
  }
  clearAuthCookies(res);
  sendSuccess(res, 200, 'Logged out successfully');
});

// @GET /api/v1/auth/me
const getMe = catchAsync(async (req, res) => {
  sendSuccess(res, 200, 'Profile fetched', { user: req.user });
});

module.exports = { register, login, refresh, logout, getMe };
