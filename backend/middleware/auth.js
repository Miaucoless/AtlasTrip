const { createClient } = require('@supabase/supabase-js');

// Cache a base Supabase client (no user JWT) to avoid recreating it on every request.
// We still need to call getUser(token) with the caller's token to verify it.
let _baseClient = null;
function getBaseClient() {
  if (!_baseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      _baseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }
  }
  return _baseClient;
}

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

    const client = getBaseClient();
    if (!client) {
      return res.status(503).json({ success: false, message: 'Auth service not configured' });
    }

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
