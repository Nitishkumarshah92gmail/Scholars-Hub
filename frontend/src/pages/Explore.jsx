import { useState, useEffect, useCallback, useRef } from 'react';
import { getExplore } from '../api';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import { SUBJECTS } from '../utils';
import { HiSearch } from 'react-icons/hi';

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const observer = useRef();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadPosts = useCallback(
    async (pageNum, reset = false) => {
      try {
        const params = { page: pageNum, limit: 12 };
        if (selectedSubject !== 'All') params.subject = selectedSubject;
        if (debouncedSearch) params.search = debouncedSearch;

        const res = await getExplore(params);
        if (reset || pageNum === 1) {
          setPosts(res.data.posts);
        } else {
          setPosts((prev) => [...prev, ...res.data.posts]);
        }
        setHasMore(res.data.hasMore);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedSubject, debouncedSearch]
  );

  useEffect(() => {
    setPage(1);
    setLoading(true);
    loadPosts(1, true);
  }, [selectedSubject, debouncedSearch, loadPosts]);

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
      {/* Search Bar — Instagram style */}
      <div className="relative mb-4">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ig-text-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="input-field pl-10 !rounded-lg !bg-ig-bg-2 dark:!bg-ig-bg-elevated text-sm"
        />
      </div>

      {/* Subject Filter — Instagram-style pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button
          onClick={() => setSelectedSubject('All')}
          className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${selectedSubject === 'All'
              ? 'bg-ig-text dark:bg-ig-text-light text-white dark:text-ig-bg-dark'
              : 'bg-ig-bg dark:bg-ig-bg-elevated text-ig-text dark:text-ig-text-light border border-ig-separator dark:border-ig-separator-dark'
            }`}
        >
          All
        </button>
        {SUBJECTS.filter((s) => s.name !== 'Other').map((subject) => (
          <button
            key={subject.name}
            onClick={() => setSelectedSubject(subject.name)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${selectedSubject === subject.name
                ? 'bg-ig-text dark:bg-ig-text-light text-white dark:text-ig-bg-dark'
                : 'bg-ig-bg dark:bg-ig-bg-elevated text-ig-text dark:text-ig-text-light border border-ig-separator dark:border-ig-separator-dark'
              }`}
          >
            {subject.name}
          </button>
        ))}
      </div>

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
            <span className="text-5xl block mb-4">📭</span>
            <h3 className="text-base font-semibold text-ig-text dark:text-ig-text-light mb-2">
              No posts found
            </h3>
            <p className="text-sm text-ig-text-2">
              Try adjusting your search or filters.
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
