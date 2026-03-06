const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

function generateTokens(userId) {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
  return { token, refreshToken };
}

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      const user = await User.create({ name, email, password });
      const { token, refreshToken } = generateTokens(user._id);

      user.refreshTokens.push(refreshToken);
      await user.save({ validateBeforeSave: false });

      res.status(201).json({ success: true, token, refreshToken, user });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const { token, refreshToken } = generateTokens(user._id);

      user.refreshTokens.push(refreshToken);
      if (user.refreshTokens.length > 5) user.refreshTokens.shift();
      await user.save({ validateBeforeSave: false });

      res.json({ success: true, token, refreshToken, user });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/logout
router.post('/logout', protect, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      req.user.refreshTokens = req.user.refreshTokens.filter((t) => t !== refreshToken);
      await req.user.save({ validateBeforeSave: false });
    }
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });

    res.json({ success: true, token });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/profile
router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().notEmpty(),
    body('bio').optional().isLength({ max: 200 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const allowed = ['name', 'bio', 'profileImage', 'preferences'];
      const updates = {};
      allowed.forEach((f) => {
        if (req.body[f] !== undefined) updates[f] = req.body[f];
      });

      const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
