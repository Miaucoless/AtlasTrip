const express = require('express');
const { body, validationResult } = require('express-validator');
const { createClient } = require('@supabase/supabase-js');
const { supabase } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

function getAdminClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
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

      const admin = getAdminClient();
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name },
      });

      if (error) {
        const status = error.message.includes('already') ? 409 : 400;
        return res.status(status).json({ success: false, message: error.message });
      }

      // Sign the user in to get their session tokens
      const anonClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
      const { data: session, error: signInError } = await anonClient.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        return res.status(400).json({ success: false, message: signInError.message });
      }

      res.status(201).json({
        success: true,
        token: session.session.access_token,
        refreshToken: session.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          name,
        },
      });
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

      const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
      const { data, error } = await client.auth.signInWithPassword({ email, password });

      if (error) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      res.json({
        success: true,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: profile?.full_name || data.user.user_metadata?.full_name,
          ...profile,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/logout
router.post('/logout', protect, async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (token) {
      const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      await client.auth.signOut();
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

    const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken });

    if (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    res.json({
      success: true,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        ...profile,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/profile
router.put(
  '/profile',
  protect,
  [
    body('full_name').optional().trim().notEmpty(),
    body('bio').optional().isLength({ max: 500 }),
    body('username').optional().trim().isLength({ min: 3 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const allowed = ['full_name', 'username', 'bio', 'avatar_url', 'home_city', 'home_country', 'travel_style', 'languages', 'preferences', 'is_public'];
      const updates = {};
      allowed.forEach((f) => {
        if (req.body[f] !== undefined) updates[f] = req.body[f];
      });

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', req.user.id)
        .select()
        .single();

      if (error) return res.status(400).json({ success: false, message: error.message });

      res.json({ success: true, user: { id: req.user.id, email: req.user.email, ...data } });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;

