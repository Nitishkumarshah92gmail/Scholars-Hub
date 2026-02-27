import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPost, likePost, commentPost, bookmarkPost, reportPost, deletePost } from '../api';
import { useAuth } from '../context/AuthContext';
import { getSubjectColor, getPostTypeIcon, getPostTypeLabel, timeAgo } from '../utils';
import toast from 'react-hot-toast';
import {
  HiHeart,
  HiOutlineHeart,
  HiOutlineChat,
  HiBookmark,
  HiOutlineBookmark,
  HiOutlineFlag,
  HiDownload,
  HiTrash,
  HiArrowLeft,
  HiOutlineShare,
  HiDotsHorizontal,
} from 'react-icons/hi';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  useEffect(() => {
    getPost(id)
      .then((res) => {
        setPost(res.data);
        setLiked(res.data.likes?.includes(user?._id));
        setLikeCount(res.data.likes?.length || 0);
        setBookmarked(user?.bookmarks?.includes(res.data._id));
        setComments(res.data.comments || []);
      })
      .catch(() => toast.error('Post not found.'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleLike = async () => {
    try {
      setLikeAnimating(true);
      const res = await likePost(id);
      setLiked(res.data.isLiked);
      setLikeCount(res.data.likeCount);
      setTimeout(() => setLikeAnimating(false), 300);
    } catch {
      setLikeAnimating(false);
      toast.error('Failed to like.');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await commentPost(id, commentText.trim());
      setComments((prev) => [res.data, ...prev]);
      setCommentText('');
    } catch {
      toast.error('Failed to comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await bookmarkPost(id);
      setBookmarked(res.data.isBookmarked);
      toast.success(res.data.isBookmarked ? 'Saved!' : 'Removed from saved.');
    } catch {
      toast.error('Failed to bookmark.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(id);
      toast.success('Post deleted.');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const handleReport = async () => {
    try {
      await reportPost(id, 'Inappropriate content');
      toast.success('Post reported.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to report.');
    }
  };

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 w-3/4 skeleton" />
          <div className="h-4 w-1/2 skeleton" />
          <div className="h-64 skeleton rounded-lg" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl block mb-4">😕</span>
        <h3 className="text-base font-semibold text-ig-text dark:text-ig-text-light">
          Sorry, this page isn't available
        </h3>
        <Link to="/dashboard" className="text-ig-primary hover:text-ig-primary-hover mt-2 inline-block text-sm font-semibold">
          Go back to feed
        </Link>
      </div>
    );
  }

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
            <a href={post.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2 text-sm">
              <HiDownload className="w-4 h-4" /> Download
            </a>
          </div>
        );
      case 'image':
        return (
          <div>
            {(post.fileUrls?.length > 0 ? post.fileUrls : [post.fileUrl]).map((url, i) => (
              <img key={i} src={url} alt={post.title} className="w-full object-contain max-h-[600px]" loading="lazy" />
            ))}
          </div>
        );
      case 'youtube_video':
        return (
          <div className="aspect-video">
            <iframe src={`https://www.youtube-nocookie.com/embed/${post.youtubeId}?rel=0`} title={post.title} className="w-full h-full" frameBorder="0" allowFullScreen loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" />
          </div>
        );
      case 'youtube_playlist': {
        const plId = post.playlistId || post.youtubeId;
        const embedSrc = post.youtubeId
          ? `https://www.youtube-nocookie.com/embed/${post.youtubeId}?list=${plId}&rel=0`
          : `https://www.youtube-nocookie.com/embed/videoseries?list=${plId}&rel=0`;
        return (
          <div className="aspect-video">
            <iframe src={embedSrc} title={post.title} className="w-full h-full" frameBorder="0" allowFullScreen loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" />
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ig-text dark:text-ig-text-light mb-4 hover:opacity-60 transition-opacity">
        <HiArrowLeft className="w-5 h-5" />
        <span className="text-sm font-semibold">Back</span>
      </button>

      <div className="card overflow-hidden">
        {/* Author Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-ig-separator dark:border-ig-separator-dark">
          <Link to={`/dashboard/profile/${post.author?._id}`} className="flex items-center gap-3 group">
            <div className="avatar-ring">
              <img
                src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name}`}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-sm text-ig-text dark:text-ig-text-light group-hover:opacity-60">
                {post.author?.name}
              </p>
              <p className="text-xs text-ig-text-2">{post.author?.school || 'Student'}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className={`subject-badge text-[10px] ${getSubjectColor(post.subject)}`}>{post.subject}</span>
            <HiDotsHorizontal className="w-5 h-5 text-ig-text dark:text-ig-text-light cursor-pointer hover:opacity-60" />
          </div>
        </div>

        {/* Content */}
        {renderContent()}

        {/* Actions */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button onClick={handleLike} className={`transition-all ${likeAnimating ? 'like-animate' : ''} ${liked ? 'text-ig-error' : 'text-ig-text dark:text-ig-text-light hover:opacity-60'}`}>
                {liked ? <HiHeart className="w-7 h-7" /> : <HiOutlineHeart className="w-7 h-7" />}
              </button>
              <button className="text-ig-text dark:text-ig-text-light hover:opacity-60">
                <HiOutlineChat className="w-7 h-7" />
              </button>
              <button className="text-ig-text dark:text-ig-text-light hover:opacity-60">
                <HiOutlineShare className="w-7 h-7" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleBookmark} className={bookmarked ? 'text-ig-text dark:text-ig-text-light' : 'text-ig-text dark:text-ig-text-light hover:opacity-60'}>
                {bookmarked ? <HiBookmark className="w-7 h-7" /> : <HiOutlineBookmark className="w-7 h-7" />}
              </button>
            </div>
          </div>

          <p className="font-semibold text-sm mb-1 text-ig-text dark:text-ig-text-light">
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </p>

          {/* Title & Description */}
          <div className="mb-1">
            <span className="font-semibold text-sm text-ig-text dark:text-ig-text-light mr-1">{post.author?.name}</span>
            <span className="text-sm text-ig-text dark:text-ig-text-light">{post.title}</span>
          </div>
          {post.description && (
            <p className="text-sm text-ig-text-2 whitespace-pre-wrap mb-1">{post.description}</p>
          )}
          <p className="text-[10px] text-ig-text-2 uppercase tracking-wider mt-2 mb-3">{timeAgo(post.createdAt)}</p>

          {/* Additional Actions */}
          <div className="flex gap-3 mb-3 border-t border-ig-separator dark:border-ig-separator-dark pt-3">
            <button onClick={handleReport} className="text-xs text-ig-text-2 hover:text-ig-error flex items-center gap-1">
              <HiOutlineFlag className="w-4 h-4" /> Report
            </button>
            {post.author?._id === user?._id && (
              <button onClick={handleDelete} className="text-xs text-ig-error flex items-center gap-1">
                <HiTrash className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="px-4 pb-4 border-t border-ig-separator dark:border-ig-separator-dark">
          <div className="mt-3 space-y-3 max-h-80 overflow-y-auto">
            {comments.map((comment, idx) => (
              <div key={comment._id || idx} className="flex gap-2">
                <Link to={`/dashboard/profile/${comment.author?._id}`}>
                  <img src={comment.author?.avatar || `https://ui-avatars.com/api/?name=${comment.author?.name}`} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                </Link>
                <div className="flex-1">
                  <p className="text-sm">
                    <Link to={`/dashboard/profile/${comment.author?._id}`} className="font-semibold text-ig-text dark:text-ig-text-light mr-1 hover:opacity-60">{comment.author?.name}</Link>
                    <span className="text-ig-text dark:text-ig-text-light">{comment.text}</span>
                  </p>
                  <span className="text-[11px] text-ig-text-2">{timeAgo(comment.createdAt)}</span>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-sm text-ig-text-2 py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>

          {/* Comment Input */}
          <form onSubmit={handleComment} className="flex items-center gap-2 mt-3 pt-3 border-t border-ig-separator dark:border-ig-separator-dark">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-sm outline-none text-ig-text dark:text-ig-text-light placeholder:text-ig-text-2 py-2"
            />
            <button type="submit" disabled={submitting || !commentText.trim()} className="text-ig-primary font-semibold text-sm disabled:opacity-30 hover:text-ig-primary-dark transition-colors">
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
