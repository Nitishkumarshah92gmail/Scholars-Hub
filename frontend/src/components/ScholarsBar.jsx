import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScholars } from '../api';

export default function ScholarsBar() {
  const [scholars, setScholars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getScholars()
      .then((res) => setScholars(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card mb-4 p-4">
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="w-12 h-3 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (scholars.length === 0) return null;

  const displayScholars = showAll ? scholars : scholars;

  return (
    <>
      <div className="card mb-4 p-3 overflow-hidden">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-semibold text-ig-text dark:text-ig-text-light">
            Scholars on Platform
          </h3>
          {scholars.length > 8 && (
            <button
              onClick={() => setShowAll(true)}
              className="text-xs font-semibold text-ig-primary hover:text-ig-primary-hover transition-colors"
            >
              See All
            </button>
          )}
        </div>
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 scroll-smooth"
        >
          {displayScholars.map((scholar) => (
            <button
              key={scholar._id}
              onClick={() => navigate(`/dashboard/profile/${scholar._id}`)}
              className="flex flex-col items-center gap-1.5 min-w-[72px] max-w-[72px] group"
            >
              <div className="relative">
                <div className="w-[62px] h-[62px] rounded-full p-[2.5px] bg-gradient-to-br from-ig-primary via-purple-500 to-pink-500 group-hover:scale-105 transition-transform">
                  <img
                    src={
                      scholar.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(scholar.name)}&background=1e3a5f&color=fbbf24&size=200`
                    }
                    alt={scholar.name}
                    className="w-full h-full rounded-full object-cover border-[2.5px] border-ig-bg dark:border-ig-bg-dark"
                  />
                </div>
                {/* Online indicator */}
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-ig-bg dark:border-ig-bg-dark" />
              </div>
              <span className="text-[11px] text-ig-text dark:text-ig-text-light truncate w-full text-center leading-tight">
                {scholar.name?.length > 10
                  ? scholar.name.slice(0, 9) + '...'
                  : scholar.name}
              </span>
            </button>
          ))}

          {/* "All" button at the end */}
          {scholars.length > 5 && (
            <button
              onClick={() => setShowAll(true)}
              className="flex flex-col items-center gap-1.5 min-w-[72px] max-w-[72px]"
            >
              <div className="w-[62px] h-[62px] rounded-full bg-gradient-to-br from-ig-primary/20 to-purple-500/20 dark:from-ig-primary/30 dark:to-purple-500/30 flex items-center justify-center hover:scale-105 transition-transform border-2 border-dashed border-ig-primary/40">
                <span className="text-base font-bold text-ig-primary">All</span>
              </div>
              <span className="text-[11px] text-ig-primary font-semibold">
                {scholars.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* "See All" Modal */}
      {showAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowAll(false)}
          />
          <div className="relative bg-ig-bg dark:bg-ig-bg-dark rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ig-separator dark:border-ig-separator-dark">
              <h3 className="text-base font-semibold text-ig-text dark:text-ig-text-light">
                All Scholars ({scholars.length})
              </h3>
              <button
                onClick={() => setShowAll(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-ig-bg-elevated transition-colors text-ig-text dark:text-ig-text-light"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scholar list */}
            <div className="overflow-y-auto flex-1 p-2">
              {scholars.map((scholar) => (
                <button
                  key={scholar._id}
                  onClick={() => {
                    setShowAll(false);
                    navigate(`/dashboard/profile/${scholar._id}`);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-ig-bg-elevated transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-ig-primary via-purple-500 to-pink-500">
                      <img
                        src={
                          scholar.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(scholar.name)}&background=1e3a5f&color=fbbf24&size=200`
                        }
                        alt={scholar.name}
                        className="w-full h-full rounded-full object-cover border-2 border-ig-bg dark:border-ig-bg-dark"
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-ig-bg dark:border-ig-bg-dark" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-ig-text dark:text-ig-text-light truncate">
                      {scholar.name}
                    </p>
                    <p className="text-xs text-ig-text-2 truncate">
                      {scholar.school || 'Scholar'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
