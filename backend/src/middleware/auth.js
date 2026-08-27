const supabase = require('../config/supabase');

/**
 * Auth middleware — verifies Supabase JWT from Authorization header.
 * Attaches req.user with { id, email, role } on success.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    // Fetch user profile (includes role)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, name, email, phone, location, avatar_url, is_verified')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'customer',
      name: profile?.name,
      phone: profile?.phone,
      location: profile?.location,
      avatarUrl: profile?.avatar_url,
      isVerified: profile?.is_verified || false,
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}

module.exports = authenticate;
