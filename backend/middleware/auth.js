const supabase = require('../config/supabase');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    // Try to get profile from database first
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      req.user = profile;
    } else {
      // Fallback: build profile from Supabase Auth metadata
      const meta = user.user_metadata || {};
      req.user = {
        id: user.id,
        name: meta.name || meta.full_name || 'User',
        email: user.email || '',
        avatar: meta.avatar || meta.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(meta.name || 'User')}&background=1e3a5f&color=fbbf24&size=200`,
        bio: meta.bio || '',
        school: meta.school || '',
        subjects: meta.subjects || [],
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at,
      };

      // Try to auto-create the profile row (best effort)
      await supabase.from('profiles').upsert({
        id: user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        bio: req.user.bio,
        school: req.user.school,
        subjects: req.user.subjects,
      }, { onConflict: 'id' }).then(() => {}).catch(() => {});
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = auth;
