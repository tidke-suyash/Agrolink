const supabase = require('../config/supabase');

/**
 * Send OTP to user's email via Supabase Auth.
 * POST /api/auth/send-otp
 */
async function sendOtp(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'OTP sent to your email. Please check your inbox.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify OTP and return session.
 * POST /api/auth/verify-otp
 */
async function verifyOtp(req, res, next) {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and OTP token are required' });
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Fetch or check if profile exists with a role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      success: true,
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email,
        ...profile,
      },
      needsOnboarding: !profile?.role || profile.role === 'customer' && !profile.name,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current user's profile.
 * GET /api/auth/profile
 */
async function getProfile(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile: data });
  } catch (err) {
    next(err);
  }
}

/**
 * Update current user's profile.
 * PUT /api/auth/profile
 */
async function updateProfile(req, res, next) {
  try {
    const { name, phone, location, avatar_url } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(avatar_url !== undefined && { avatar_url }),
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ profile: data });
  } catch (err) {
    next(err);
  }
}

/**
 * Set user role (first-time onboarding).
 * POST /api/auth/set-role
 */
async function setRole(req, res, next) {
  try {
    const { role, name, phone, location } = req.body;

    if (!role || !['farmer', 'customer'].includes(role)) {
      return res.status(400).json({ error: 'Valid role (farmer/customer) is required' });
    }

    // Use upsert to handle case where profile wasn't created by trigger
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: req.user.id,
        email: req.user.email,
        role,
        ...(name && { name }),
        ...(phone && { phone }),
        ...(location && { location }),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ profile: data });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete current user account completely.
 * DELETE /api/auth/account
 */
async function deleteAccount(req, res, next) {
  try {
    const userId = req.user.id;

    // Delete profile record first
    await supabase.from('profiles').delete().eq('id', userId);

    // Delete auth.users entry using admin client
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, message: 'Account successfully deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { sendOtp, verifyOtp, getProfile, updateProfile, setRole, deleteAccount };
