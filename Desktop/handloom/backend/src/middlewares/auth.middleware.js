const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');

    if (!user) {
      return next(new AppError('User not found. Token invalid.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Account deactivated. Contact support.', 403));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please login again.', 401));
    }
    return next(new AppError('Invalid token.', 401));
  }
};

module.exports = { protect };
