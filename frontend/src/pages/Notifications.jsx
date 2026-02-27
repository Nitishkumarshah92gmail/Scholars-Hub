import { useState, useEffect } from 'react';
import { getNotifications, markNotificationsRead } from '../api';
import { Link } from 'react-router-dom';
import { timeAgo } from '../utils';
import { HiHeart, HiChat, HiUserAdd } from 'react-icons/hi';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .then((res) => {
        setNotifications(res.data.notifications);
        if (res.data.unreadCount > 0) {
          markNotificationsRead();
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <HiHeart className="w-5 h-5 text-ig-error" />;
      case 'comment': return <HiChat className="w-5 h-5 text-ig-primary" />;
      case 'follow': return <HiUserAdd className="w-5 h-5 text-ig-success" />;
      default: return null;
    }
  };

  const getMessage = (notif) => {
    switch (notif.type) {
      case 'like': return <><strong>{notif.sender?.name}</strong> liked your post <span className="text-ig-text-2">"{notif.post?.title}"</span></>;
      case 'comment': return <><strong>{notif.sender?.name}</strong> commented on your post <span className="text-ig-text-2">"{notif.post?.title}"</span></>;
      case 'follow': return <><strong>{notif.sender?.name}</strong> started following you</>;
      default: return '';
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-ig-text dark:text-ig-text-light mb-4">
          Notifications
        </h1>
        <div className="space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-11 h-11 rounded-full skeleton" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 skeleton" />
                <div className="h-2.5 w-16 skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-ig-text dark:text-ig-text-light mb-4">
        Notifications
      </h1>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <HiHeart className="w-16 h-16 text-ig-text-2 mx-auto mb-4 opacity-30" />
          <h3 className="text-base font-semibold text-ig-text dark:text-ig-text-light mb-1">
            Activity On Your Posts
          </h3>
          <p className="text-sm text-ig-text-2">
            When someone likes or comments on your posts, you'll see it here.
          </p>
        </div>
      ) : (
        <div>
          {notifications.map((notif) => (
            <Link
              key={notif._id}
              to={notif.type === 'follow' ? `/dashboard/profile/${notif.sender?._id}` : `/dashboard/post/${notif.post?._id}`}
              className={`flex items-center gap-3 px-3 py-3 hover:bg-ig-bg-2 dark:hover:bg-ig-bg-elevated transition-colors rounded-lg ${!notif.read ? 'bg-ig-primary/5' : ''
                }`}
            >
              <img
                src={notif.sender?.avatar || `https://ui-avatars.com/api/?name=${notif.sender?.name}`}
                alt=""
                className="w-11 h-11 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ig-text dark:text-ig-text-light leading-snug">
                  {getMessage(notif)}
                  <span className="text-ig-text-2 ml-1">{timeAgo(notif.createdAt)}</span>
                </p>
              </div>
              <div className="flex-shrink-0">{getIcon(notif.type)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
