const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_online_classroom_2026'
      );

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'Người dùng không tồn tại' });
      }

      if (!user.isActive) {
        return res
          .status(403)
          .json({ message: 'Tài khoản của bạn đã bị quản trị viên khóa' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Không tìm thấy mã xác thực (Token)' });
  }
};

const optionalProtect = async (req, res, next) => {
  if (!req.headers.authorization?.startsWith('Bearer ')) return next();
  try {
    const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET || 'super_secret_jwt_key_online_classroom_2026');
    const user = await User.findById(decoded.id).select('-password');
    if (user?.isActive) req.user = user;
  } catch (error) {
    // Public course browsing remains available when a stale token is present.
  }
  next();
};

// Check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Vai trò [${req.user?.role || 'Khách'}] không có quyền thực hiện hành động này`,
      });
    }
    next();
  };
};

module.exports = { protect, optionalProtect, authorize };
