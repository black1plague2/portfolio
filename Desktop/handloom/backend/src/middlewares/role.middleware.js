const { AppError } = require('../utils/apiResponse');

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Access denied. Role '${req.user.role}' is not authorized.`, 403));
    }
    next();
  };
};

const requireVerified = (req, res, next) => {
  if (!req.user.verified) {
    return next(new AppError('Account not verified. Please complete KYC.', 403));
  }
  next();
};

module.exports = { restrictTo, requireVerified };
