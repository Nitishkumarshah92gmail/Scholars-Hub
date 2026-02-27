const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications — get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: notifications, error: notifErr } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:profiles!sender_id(id, name, avatar),
        post:posts!post_id(id, title, type)
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (notifErr && notifErr.code === 'PGRST205') {
      return res.json({ notifications: [], unreadCount: 0 });
    }

    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    // Transform to match frontend expectations
    const transformed = (notifications || []).map((n) => ({
      _id: n.id,
      type: n.type,
      read: n.read,
      sender: n.sender
        ? { _id: n.sender.id, name: n.sender.name, avatar: n.sender.avatar }
        : null,
      post: n.post
        ? { _id: n.post.id, title: n.post.title, type: n.post.type }
        : null,
      createdAt: n.created_at,
    }));

    res.json({ notifications: transformed, unreadCount: unreadCount || 0 });
  } catch (error) {
    console.error('Notifications error:', error);
    res.json({ notifications: [], unreadCount: 0 });
  }
});

// PUT /api/notifications/read — mark all as read
router.put('/read', auth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', req.user.id)
      .eq('read', false);

    if (error && error.code === 'PGRST205') {
      return res.json({ message: 'No notifications to mark.' });
    }

    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    res.json({ message: 'No notifications to mark.' });
  }
});

module.exports = router;
