const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper: transform user profile
function transformUser(profile, followers, following, bookmarkIds) {
  return {
    _id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar,
    bio: profile.bio,
    school: profile.school,
    subjects: profile.subjects || [],
    followers: (followers || []).map((f) => ({
      _id: f.follower?.id || f.follower_id,
      name: f.follower?.name,
      avatar: f.follower?.avatar,
    })),
    following: (following || []).map((f) => ({
      _id: f.following?.id || f.following_id,
      name: f.following?.name,
      avatar: f.following?.avatar,
    })),
    bookmarks: bookmarkIds || [],
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

// Helper: transform post
function transformPost(post) {
  return {
    _id: post.id,
    author: post.author
      ? { _id: post.author.id, name: post.author.name, avatar: post.author.avatar, school: post.author.school }
      : null,
    type: post.type,
    fileUrl: post.file_url,
    fileUrls: post.file_urls || [],
    youtubeId: post.youtube_id || '',
    playlistId: post.playlist_id || '',
    title: post.title,
    description: post.description,
    subject: post.subject,
    likes: (post.likes || []).map((l) => l.user_id),
    likeCount: (post.likes || []).length,
    comments: (post.comments || []).map((c) => ({
      _id: c.id,
      text: c.text,
      author: c.author
        ? { _id: c.author.id, name: c.author.name, avatar: c.author.avatar }
        : null,
      createdAt: c.created_at,
    })),
    commentCount: (post.comments || []).length,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
  };
}

// GET /api/users/search/find?q=query — search users (must be before /:id)
router.get('/search/find', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, name, avatar, school, subjects')
      .or(`name.ilike.%${q}%,school.ilike.%${q}%`)
      .limit(20);

    if (error && error.code === 'PGRST205') return res.json([]);

    res.json(
      (users || []).map((u) => ({
        _id: u.id,
        name: u.name,
        avatar: u.avatar,
        school: u.school,
        subjects: u.subjects,
      }))
    );
  } catch (error) {
    console.error('Search error:', error);
    res.json([]);
  }
});

// POST /api/users/bookmark/:postId — bookmark/unbookmark post
router.post('/bookmark/:postId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    // Check if already bookmarked
    const { data: existing, error: checkErr } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();

    if (checkErr && checkErr.code === 'PGRST205') {
      return res.status(503).json({ error: 'Database tables not set up yet.' });
    }

    let isBookmarked;
    if (existing) {
      await supabase.from('bookmarks').delete().eq('id', existing.id);
      isBookmarked = false;
    } else {
      await supabase.from('bookmarks').insert({ user_id: userId, post_id: postId });
      isBookmarked = true;
    }

    // Get all bookmark IDs
    const { data: allBookmarks } = await supabase
      .from('bookmarks')
      .select('post_id')
      .eq('user_id', userId);

    res.json({
      isBookmarked,
      bookmarks: (allBookmarks || []).map((b) => b.post_id),
    });
  } catch (error) {
    console.error('Bookmark error:', error);
    res.status(500).json({ error: 'Failed to bookmark.' });
  }
});

// GET /api/users/:id/bookmarks — get bookmarked posts
router.get('/:id/bookmarks', auth, async (req, res) => {
  try {
    const { data: bookmarkData, error: bErr } = await supabase
      .from('bookmarks')
      .select('post_id')
      .eq('user_id', req.params.id);

    if (bErr && bErr.code === 'PGRST205') return res.json([]);

    const postIds = (bookmarkData || []).map((b) => b.post_id);
    if (postIds.length === 0) return res.json([]);

    const { data: posts } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id(id, name, avatar, school),
        comments(id, text, created_at, author:profiles!author_id(id, name, avatar)),
        likes(user_id)
      `)
      .in('id', postIds)
      .order('created_at', { ascending: false });

    res.json((posts || []).map(transformPost));
  } catch (error) {
    console.error('Bookmarks error:', error);
    res.json([]);
  }
});

// GET /api/users/:id — get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // If tables don't exist, return basic auth info for own profile
    if (profileErr && profileErr.code === 'PGRST205') {
      if (userId === req.user.id) {
        const meta = req.user.user_metadata || {};
        return res.json({
          user: {
            _id: req.user.id,
            name: meta.name || 'User',
            email: req.user.email || '',
            avatar: meta.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(meta.name || 'User')}&background=1e3a5f&color=fbbf24&size=200`,
            bio: meta.bio || '',
            school: meta.school || '',
            subjects: meta.subjects || [],
            followers: [],
            following: [],
            bookmarks: [],
            createdAt: req.user.created_at,
            updatedAt: req.user.created_at,
          },
          posts: [],
        });
      }
      return res.status(404).json({ error: 'User not found.' });
    }

    if (!profile) return res.status(404).json({ error: 'User not found.' });

    // Get followers (graceful)
    const { data: followers } = await supabase
      .from('follows')
      .select('follower_id, follower:profiles!follower_id(id, name, avatar)')
      .eq('following_id', userId)
      .then(r => r).catch(() => ({ data: [] }));

    // Get following (graceful)
    const { data: following } = await supabase
      .from('follows')
      .select('following_id, following:profiles!following_id(id, name, avatar)')
      .eq('follower_id', userId)
      .then(r => r).catch(() => ({ data: [] }));

    // Get bookmarks (graceful)
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('post_id')
      .eq('user_id', userId)
      .then(r => r).catch(() => ({ data: [] }));

    const bookmarkIds = (bookmarks || []).map((b) => b.post_id);

    // Get posts (graceful)
    const { data: posts } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id(id, name, avatar, school),
        comments(id, text, created_at, author:profiles!author_id(id, name, avatar)),
        likes(user_id)
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .then(r => r).catch(() => ({ data: [] }));

    res.json({
      user: transformUser(profile, followers || [], following || [], bookmarkIds),
      posts: (posts || []).map(transformPost),
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

// PUT /api/users/:id — edit profile
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const { name, bio, school, subjects, avatar } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (school !== undefined) updates.school = school;
    if (subjects) {
      updates.subjects = typeof subjects === 'string' ? JSON.parse(subjects) : subjects;
    }
    if (avatar) updates.avatar = avatar;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) {
      console.error('Update profile error:', error);
      if (error.code === 'PGRST205') {
        return res.status(503).json({ error: 'Database tables not set up yet.' });
      }
      return res.status(500).json({ error: 'Failed to update profile.' });
    }

    // Get followers/following for response
    const { data: followers } = await supabase
      .from('follows')
      .select('follower_id, follower:profiles!follower_id(id, name, avatar)')
      .eq('following_id', req.params.id);

    const { data: following } = await supabase
      .from('follows')
      .select('following_id, following:profiles!following_id(id, name, avatar)')
      .eq('follower_id', req.params.id);

    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('post_id')
      .eq('user_id', req.params.id);

    const bookmarkIds = (bookmarks || []).map((b) => b.post_id);

    res.json(transformUser(profile, followers, following, bookmarkIds));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// POST /api/users/:id/follow — follow/unfollow user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentId = req.user.id;

    if (targetId === currentId) {
      return res.status(400).json({ error: 'Cannot follow yourself.' });
    }

    // Check if target exists
    const { data: target, error: targetErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', targetId)
      .maybeSingle();

    if (targetErr && targetErr.code === 'PGRST205') {
      return res.status(503).json({ error: 'Database tables not set up yet.' });
    }
    if (!target) return res.status(404).json({ error: 'User not found.' });

    // Check if already following
    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentId)
      .eq('following_id', targetId)
      .maybeSingle();

    let isFollowing;
    if (existing) {
      // Unfollow
      await supabase.from('follows').delete().eq('id', existing.id);
      isFollowing = false;
    } else {
      // Follow
      await supabase.from('follows').insert({
        follower_id: currentId,
        following_id: targetId,
      });
      isFollowing = true;

      // Create notification
      await supabase.from('notifications').insert({
        recipient_id: targetId,
        sender_id: currentId,
        type: 'follow',
      });
    }

    // Get updated counts
    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetId);

    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', currentId);

    res.json({
      isFollowing,
      followersCount: followersCount || 0,
      followingCount: followingCount || 0,
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Failed to follow/unfollow.' });
  }
});

module.exports = router;
