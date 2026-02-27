import { useState, useEffect, useCallback, useRef } from 'react';
import { getFeed } from '../api';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import { useAuth } from '../context/AuthContext';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();

  const loadPosts = useCallback(async (pageNum) => {
    try {
      const res = await getFeed(pageNum);
      if (pageNum === 1) {
        setPosts(res.data.posts);
      } else {
        setPosts((prev) => [...prev, ...res.data.posts]);
      }
      setHasMore(res.data.hasMore || res.data.posts.length === 10);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  const lastPostRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setLoadingMore(true);
          const nextPage = page + 1;
          setPage(nextPage);
          loadPosts(nextPage);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore, page, loadPosts]
  );

  return (
    <div>

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="text-base font-semibold text-ig-text dark:text-ig-text-light mb-2">
              No posts yet
            </h3>
            <p className="text-sm text-ig-text-2">
              Follow some students or explore to see posts in your feed!
            </p>
          </div>
        ) : (
          posts.map((post, idx) => (
            <div key={post._id} ref={idx === posts.length - 1 ? lastPostRef : null}>
              <PostCard post={post} />
            </div>
          ))
        )}

        {loadingMore && <PostSkeleton />}
      </div>
    </div>
  );
}
