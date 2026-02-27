import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookmarks } from '../api';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import { HiOutlineBookmark } from 'react-icons/hi';

export default function Bookmarks() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      getBookmarks(user._id)
        .then((res) => setPosts(res.data))
        .catch(() => { })
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-ig-text dark:text-ig-text-light">
          Saved
        </h1>
        <span className="text-xs text-ig-text-2">Only you can see what you've saved</span>
      </div>

      <div className="space-y-4">
        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts.length === 0 ? (
          <div className="card p-16 text-center">
            <HiOutlineBookmark className="w-16 h-16 text-ig-text dark:text-ig-text-light mx-auto mb-4 stroke-1" />
            <h3 className="text-xl font-semibold text-ig-text dark:text-ig-text-light mb-2">
              Save
            </h3>
            <p className="text-sm text-ig-text-2 max-w-[300px] mx-auto">
              Save posts that you want to see again. No one is notified, and only you can see what you've saved.
            </p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
}
