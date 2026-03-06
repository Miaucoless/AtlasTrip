const { createClient } = require('@supabase/supabase-js');

/**
 * Verify a Supabase JWT and attach the user to req.user.
 * The token is the JWT issued by Supabase Auth (access_token).
 */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized – no token' });
    }

    const token = authHeader.split(' ')[1];

    // Create a per-request Supabase client using the caller's JWT so that
    // Supabase can verify it against the project's JWT secret automatically.
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(503).json({ success: false, message: 'Auth service not configured' });
    }

    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error } = await client.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { protect };

