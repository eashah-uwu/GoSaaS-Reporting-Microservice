const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return next(new Error('No token provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('Unauthorized'));
    }
    req.user = user;
    console.log(req.user)
    next();
  } catch (error) {
    next(new Error('Unauthorized'));
  }
};

module.exports = authMiddleware;
