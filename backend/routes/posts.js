const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

// Helpers: extract YouTube ID from URL
function extractYoutubeId(url) {
  // Extract video ID
  let videoId = '';
  const videoPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of videoPatterns) {
    const match = url.match(pattern);
    if (match) { videoId = match[1]; break; }
  }

  // Extract playlist ID
  const playlistPattern = /[?&]list=([a-zA-Z0-9_-]+)/;
  const playlistMatch = url.match(playlistPattern);
  const playlistId = playlistMatch ? playlistMatch[1] : '';

  // If playlist URL (with or without a video)
  if (playlistId) {
    return { id: videoId, playlistId, type: 'youtube_playlist' };
  }
  // Pure video URL
  if (videoId) {
    return { id: videoId, playlistId: '', type: 'youtube_video' };
  }
  return null;
}

// Helper: transform post to match frontend expectations
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
    comments: (post.comments || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((c) => ({
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

const POST_SELECT = `
  *,
  author:profiles!author_id(id, name, avatar, school),
  comments(id, text, created_at, author:profiles!author_id(id, name, avatar)),
  likes(user_id)
`;

// GET /api/posts — feed (posts from followed users + trending)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    // Get following IDs
    const { data: followData, error: followErr } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followErr && followErr.code === 'PGRST205') {
      return res.json({ posts: [], page: 1, totalPages: 1, hasMore: false });
    }

    const followingIds = (followData || []).map((f) => f.following_id);
    followingIds.push(userId);

    // Get feed posts
    const { data: feedPosts, count, error: postsErr } = await supabase
      .from('posts')
      .select(POST_SELECT, { count: 'exact' })
      .in('author_id', followingIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsErr && postsErr.code === 'PGRST205') {
      return res.json({ posts: [], page: 1, totalPages: 1, hasMore: false });
    }

    let posts = feedPosts || [];

    // If not enough posts, fill with trending/recent from other users
    if (posts.length < limit) {
      const remaining = limit - posts.length;
      const existingIds = posts.map((p) => p.id);

      let trendingQuery = supabase
        .from('posts')
        .select(POST_SELECT)
        .order('created_at', { ascending: false })
        .limit(remaining + existingIds.length);

      const { data: allRecent } = await trendingQuery;
      const trending = (allRecent || [])
        .filter((p) => !existingIds.includes(p.id))
        .slice(0, remaining);
      posts = [...posts, ...trending];
    }

    // Limit comments to 3 per post
    const transformedPosts = posts.map((p) => {
      const tp = transformPost(p);
      tp.comments = tp.comments.slice(0, 3);
      return tp;
    });

    res.json({
      posts: transformedPosts,
      page,
      totalPages: Math.ceil((count || 0) / limit) || 1,
      hasMore: offset + posts.length < (count || 0),
    });
  } catch (error) {
    console.error('Feed error:', error);
    // If tables don't exist, return empty
    if (error?.code === 'PGRST205' || error?.message?.includes('does not exist')) {
      return res.json({ posts: [], page: 1, totalPages: 1, hasMore: false });
    }
    res.status(500).json({ error: 'Failed to load feed.' });
  }
});

// GET /api/posts/explore — all posts with filters
router.get('/explore', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const { subject, search, type } = req.query;

    let query = supabase
      .from('posts')
      .select(POST_SELECT, { count: 'exact' });

    if (subject && subject !== 'All') {
      query = query.eq('subject', subject);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (search) {
      const sanitized = search.replace(/[%_,()]/g, '');
      query = query.or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%,subject.ilike.%${sanitized}%`);
    }

    const { data: posts, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error && error.code === 'PGRST205') {
      return res.json({ posts: [], page: 1, totalPages: 1, hasMore: false, total: 0 });
    }

    res.json({
      posts: (posts || []).map(transformPost),
      page,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: offset + limit < (count || 0),
      total: count || 0,
    });
  } catch (error) {
    console.error('Explore error:', error);
    if (error?.code === 'PGRST205') {
      return res.json({ posts: [], page: 1, totalPages: 1, hasMore: false, total: 0 });
    }
    res.status(500).json({ error: 'Failed to load posts.' });
  }
});

// POST /api/posts — create post
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, subject, type, youtubeUrl, fileUrl, fileUrls } = req.body;

    if (!title || !subject || !type) {
      return res.status(400).json({ error: 'Title, subject, and type are required.' });
    }

    const postData = {
      author_id: req.user.id,
      title,
      description: description || '',
      subject,
      type,
      file_url: '',
      file_urls: [],
      youtube_id: '',
      playlist_id: '',
    };

    if (type === 'youtube_video' || type === 'youtube_playlist') {
      if (!youtubeUrl) {
        return res.status(400).json({ error: 'YouTube URL is required.' });
      }
      const extracted = extractYoutubeId(youtubeUrl);
      if (!extracted) {
        return res.status(400).json({ error: 'Invalid YouTube URL.' });
      }
      postData.youtube_id = extracted.id || '';
      postData.playlist_id = extracted.playlistId || '';
      postData.file_url = youtubeUrl;
      postData.type = extracted.type;
    } else {
      postData.file_url = fileUrl || '';
      postData.file_urls = fileUrls || [];
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert(postData)
      .select(POST_SELECT)
      .single();

    if (error) {
      console.error('Create post error:', error);
      if (error.code === 'PGRST205') {
        return res.status(503).json({ error: 'Database tables are not set up yet. Please run the SQL migration in your Supabase dashboard.' });
      }
      return res.status(500).json({ error: 'Failed to create post.' });
    }

    res.status(201).json(transformPost(post));
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post.' });
  }
});

// GET /api/posts/:id — single post
router.get('/:id', auth, async (req, res) => {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select(POST_SELECT)
      .eq('id', req.params.id)
      .single();

    if (error && error.code === 'PGRST205') return res.status(404).json({ error: 'Post not found (tables not set up).' });
    if (error || !post) return res.status(404).json({ error: 'Post not found.' });

    res.json(transformPost(post));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load post.' });
  }
});

// POST /api/posts/:id/like — like/unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Check if post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id')
      .eq('id', postId)
      .single();

    if (!post) return res.status(404).json({ error: 'Post not found.' });

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();

    let isLiked;
    if (existingLike) {
      // Unlike
      await supabase.from('likes').delete().eq('id', existingLike.id);
      isLiked = false;
    } else {
      // Like
      await supabase.from('likes').insert({ user_id: userId, post_id: postId });
      isLiked = true;

      // Create notification (don't notify self)
      if (post.author_id !== userId) {
        await supabase.from('notifications').insert({
          recipient_id: post.author_id,
          sender_id: userId,
          type: 'like',
          post_id: postId,
        });
      }
    }

    // Get updated like count
    const { data: allLikes } = await supabase
      .from('likes')
      .select('user_id')
      .eq('post_id', postId);

    res.json({
      likes: (allLikes || []).map((l) => l.user_id),
      likeCount: (allLikes || []).length,
      isLiked,
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to like post.' });
  }
});

// POST /api/posts/:id/comment — add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text is required.' });

    const postId = req.params.id;

    // Check post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id')
      .eq('id', postId)
      .single();

    if (!post) return res.status(404).json({ error: 'Post not found.' });

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: req.user.id,
        text,
      })
      .select('id, text, created_at, author:profiles!author_id(id, name, avatar)')
      .single();

    if (error) {
      console.error('Comment error:', error);
      return res.status(500).json({ error: 'Failed to add comment.' });
    }

    // Create notification
    if (post.author_id !== req.user.id) {
      await supabase.from('notifications').insert({
        recipient_id: post.author_id,
        sender_id: req.user.id,
        type: 'comment',
        post_id: postId,
      });
    }

    res.status(201).json({
      _id: comment.id,
      text: comment.text,
      author: comment.author
        ? { _id: comment.author.id, name: comment.author.name, avatar: comment.author.avatar }
        : null,
      createdAt: comment.created_at,
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

// POST /api/posts/:id/report — report a post
router.post('/:id/report', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const postId = req.params.id;

    // Check if already reported
    const { data: existing } = await supabase
      .from('reports')
      .select('id')
      .eq('post_id', postId)
      .eq('reporter_id', req.user.id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'You have already reported this post.' });
    }

    await supabase.from('reports').insert({
      post_id: postId,
      reporter_id: req.user.id,
      reason: reason || 'No reason provided',
    });

    res.json({ message: 'Post reported successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to report post.' });
  }
});

// DELETE /api/posts/:id — delete post (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;

    const { data: post, error: fetchErr } = await supabase
      .from('posts')
      .select('id, author_id, file_url, file_urls')
      .eq('id', postId)
      .single();

    if (fetchErr || !post) {
      console.error('Delete - post fetch error:', fetchErr);
      return res.status(404).json({ error: 'Post not found.' });
    }
    if (post.author_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post.' });
    }

    // Delete related data — ignore errors for tables that may not exist
    const tables = ['comments', 'likes', 'bookmarks', 'notifications', 'reports'];
    for (const table of tables) {
      try {
        await supabase.from(table).delete().eq('post_id', postId);
      } catch (e) {
        // Table might not exist, skip
      }
    }

    // Delete the post itself
    const { error: deleteErr } = await supabase.from('posts').delete().eq('id', postId);
    if (deleteErr) {
      console.error('Delete - post delete error:', deleteErr);
      return res.status(500).json({ error: 'Failed to delete post from database.' });
    }

    console.log(`Post ${postId} deleted by user ${req.user.id}`);
    res.json({ message: 'Post deleted.' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete post.' });
  }
});

module.exports = router;
