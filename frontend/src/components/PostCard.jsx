import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { likePost, commentPost, bookmarkPost, reportPost, deletePost } from '../api';
import { useNavigate } from 'react-router-dom';
import { getSubjectColor, getPostTypeIcon, timeAgo } from '../utils';
import toast from 'react-hot-toast';
import {
  HiHeart,
  HiOutlineHeart,
  HiOutlineChat,
  HiBookmark,
  HiOutlineBookmark,
  HiOutlineFlag,
  HiDownload,
  HiDotsHorizontal,
  HiOutlineShare,
  HiTrash,
} from 'react-icons/hi';

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?._id === post.author?._id;
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [bookmarked, setBookmarked] = useState(user?.bookmarks?.includes(post._id));
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [showMenu, setShowMenu] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleLike = async () => {
    try {
      setLikeAnimating(true);
      const res = await likePost(post._id);
      setLiked(res.data.isLiked);
      setLikeCount(res.data.likeCount);
      setTimeout(() => setLikeAnimating(false), 300);
    } catch {
      setLikeAnimating(false);
      toast.error('Failed to like post.');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await commentPost(post._id, commentText.trim());
      setComments((prev) => [res.data, ...prev]);
      setCommentText('');
    } catch {
      toast.error('Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await bookmarkPost(post._id);
      setBookmarked(res.data.isBookmarked);
      toast.success(res.data.isBookmarked ? 'Post saved.' : 'Post removed from saved.');
    } catch {
      toast.error('Failed to bookmark.');
    }
  };

  const handleReport = async () => {
    try {
      await reportPost(post._id, 'Inappropriate content');
      toast.success('Post reported. We will review it.');
      setShowMenu(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to report.');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await deletePost(post._id);
      toast.success('Post deleted.');
      setDeleted(true);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete post.');
      setConfirmDelete(false);
    }
  };

  if (deleted) return null;

  const renderContent = () => {
    switch (post.type) {
      case 'pdf':
        return (
          <div className="bg-ig-bg-2 dark:bg-ig-bg-elevated p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">📄</span>
              <div>
                <p className="font-semibold text-ig-text dark:text-ig-text-light">PDF Document</p>
                <p className="text-sm text-ig-text-2">{post.title}</p>
              </div>
            </div>
            <a
              href={post.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <HiDownload className="w-4 h-4" />
              Download
            </a>
          </div>
        );
      case 'image':
        return (
          <div className={`${(post.fileUrls?.length || 0) > 1 ? 'grid grid-cols-2 gap-0.5' : ''}`}>
            {(post.fileUrls?.length > 0 ? post.fileUrls : [post.fileUrl]).map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`${post.title} - ${i + 1}`}
                className="w-full object-cover max-h-[585px] cursor-pointer"
                loading="lazy"
              />
            ))}
          </div>
        );
      case 'youtube_video': {
        // Fallback: extract ID from fileUrl if youtubeId is missing
        let videoId = post.youtubeId;
        if (!videoId && post.fileUrl) {
          const m = post.fileUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
          if (m) videoId = m[1];
        }
        if (!videoId) return <div className="p-6 text-center text-ig-text-2">Invalid YouTube URL</div>;
        return (
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
              title={post.title}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            />
          </div>
        );
      }
      case 'youtube_playlist': {
        const plId = post.playlistId || '';
        let vidId = post.youtubeId || '';
        // Fallback: extract from fileUrl
        if (!vidId && !plId && post.fileUrl) {
          const vm = post.fileUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          if (vm) vidId = vm[1];
          const pm = post.fileUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/);
          if (pm) {
            const extractedPlId = pm[1];
            const embedSrc = vidId
              ? `https://www.youtube-nocookie.com/embed/${vidId}?list=${extractedPlId}&rel=0`
              : `https://www.youtube-nocookie.com/embed/videoseries?list=${extractedPlId}&rel=0`;
            return (
              <div className="aspect-video">
                <iframe src={embedSrc} title={post.title} className="w-full h-full" frameBorder="0" allowFullScreen loading="lazy" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" />
              </div>
            );
          }
        }
        const embedSrc = vidId
          ? `https://www.youtube-nocookie.com/embed/${vidId}?list=${plId}&rel=0`
          : `https://www.youtube-nocookie.com/embed/videoseries?list=${plId}&rel=0`;
        return (
          <div className="aspect-video">
            <iframe
              src={embedSrc}
              title={post.title}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            />
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="card overflow-hidden animate-fade-in">
      {/* Header — Instagram style */}
      <div className="px-4 py-3 flex items-center justify-between">
        <Link to={`/dashboard/profile/${post.author?._id}`} className="flex items-center gap-3 group">
          <div className="avatar-ring">
            <img
              src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}`}
              alt={post.author?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-sm text-ig-text dark:text-ig-text-light group-hover:opacity-60 transition-opacity">
              {post.author?.name}
            </p>
            <p className="text-xs text-ig-text-2">
              {post.author?.school || 'Student'} · {timeAgo(post.createdAt)}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className={`subject-badge text-[10px] ${getSubjectColor(post.subject)}`}>
            {post.subject}
          </span>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:opacity-60 transition-opacity">
              <HiDotsHorizontal className="w-5 h-5 text-ig-text dark:text-ig-text-light" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-ig-bg dark:bg-ig-bg-elevated rounded-xl shadow-ig-elevated border border-ig-separator dark:border-ig-separator-dark py-1 w-48 z-10 animate-fade-in">
                {isOwner && (
                  <>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-3 text-sm text-ig-error hover:bg-ig-bg-2 dark:hover:bg-ig-bg-dark flex items-center gap-3 font-semibold"
                    >
                      <HiTrash className="w-5 h-5" />
                      {confirmDelete ? 'Confirm Delete?' : 'Delete'}
                    </button>
                    {confirmDelete && (
                      <button
                        onClick={() => { setConfirmDelete(false); setShowMenu(false); }}
                        className="w-full text-left px-4 py-3 text-sm text-ig-text-2 hover:bg-ig-bg-2 dark:hover:bg-ig-bg-dark flex items-center gap-3"
                      >
                        Cancel
                      </button>
                    )}
                  </>
                )}
                {!isOwner && (
                  <button
                    onClick={handleReport}
                    className="w-full text-left px-4 py-3 text-sm text-ig-error hover:bg-ig-bg-2 dark:hover:bg-ig-bg-dark flex items-center gap-3 font-semibold"
                  >
                    <HiOutlineFlag className="w-5 h-5" />
                    Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="border-t border-b border-ig-separator/30 dark:border-ig-separator-dark/30">
        {renderContent()}
      </div>

      {/* Actions — Instagram style */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`transition-all ${likeAnimating ? 'like-animate' : ''} ${liked ? 'text-ig-error' : 'text-ig-text dark:text-ig-text-light hover:opacity-60'
                }`}
            >
              {liked ? <HiHeart className="w-7 h-7" /> : <HiOutlineHeart className="w-7 h-7" />}
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="text-ig-text dark:text-ig-text-light hover:opacity-60 transition-opacity"
            >
              <HiOutlineChat className="w-7 h-7" />
            </button>

            <button className="text-ig-text dark:text-ig-text-light hover:opacity-60 transition-opacity">
              <HiOutlineShare className="w-7 h-7" />
            </button>
          </div>

          <button
            onClick={handleBookmark}
            className={`transition-all ${bookmarked ? 'text-ig-text dark:text-ig-text-light' : 'text-ig-text dark:text-ig-text-light hover:opacity-60'}`}
          >
            {bookmarked ? <HiBookmark className="w-7 h-7" /> : <HiOutlineBookmark className="w-7 h-7" />}
          </button>
        </div>

        {/* Like count */}
        <p className="font-semibold text-sm text-ig-text dark:text-ig-text-light mb-1">
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </p>

        {/* Title & Description */}
        <div className="mb-1">
          <Link to={`/dashboard/post/${post._id}`}>
            <span className="font-semibold text-sm text-ig-text dark:text-ig-text-light mr-1">
              {post.author?.name}
            </span>
            <span className="text-sm text-ig-text dark:text-ig-text-light">
              {post.title}
            </span>
          </Link>
        </div>
        {post.description && (
          <p className="text-sm text-ig-text-2 line-clamp-2 mb-1">
            {post.description}
          </p>
        )}

        {/* View all comments link */}
        {comments.length > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-sm text-ig-text-2 mb-1 block"
          >
            View all {comments.length} comments
          </button>
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-ig-text-2 uppercase tracking-wider mt-1 mb-2">
          {timeAgo(post.createdAt)}
        </p>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-3 border-t border-ig-separator dark:border-ig-separator-dark animate-fade-in">
          {/* Comments List */}
          <div className="mt-3 space-y-3 max-h-60 overflow-y-auto">
            {comments.map((comment, idx) => (
              <div key={comment._id || idx} className="flex gap-2">
                <Link to={`/dashboard/profile/${comment.author?._id}`}>
                  <img
                    src={comment.author?.avatar || `https://ui-avatars.com/api/?name=${comment.author?.name}`}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                </Link>
                <div className="flex-1">
                  <p className="text-sm">
                    <Link to={`/dashboard/profile/${comment.author?._id}`} className="font-semibold text-ig-text dark:text-ig-text-light mr-1 hover:opacity-60">
                      {comment.author?.name}
                    </Link>
                    <span className="text-ig-text dark:text-ig-text-light">{comment.text}</span>
                  </p>
                  <span className="text-[11px] text-ig-text-2">{timeAgo(comment.createdAt)}</span>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-sm text-ig-text-2 py-2">No comments yet. Be the first!</p>
            )}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleComment} className="flex items-center gap-2 mt-3 pt-3 border-t border-ig-separator dark:border-ig-separator-dark">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
              alt=""
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-sm outline-none text-ig-text dark:text-ig-text-light placeholder:text-ig-text-2 py-2"
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="text-ig-primary font-semibold text-sm disabled:opacity-30 hover:text-ig-primary-dark transition-colors"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
