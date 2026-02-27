// Subject list with color mappings
export const SUBJECTS = [
  { name: 'Mathematics', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { name: 'Science', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  { name: 'History', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { name: 'Programming', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { name: 'Physics', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
  { name: 'Chemistry', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  { name: 'Biology', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { name: 'English', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  { name: 'Art', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
  { name: 'Music', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
  { name: 'Economics', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
  { name: 'Psychology', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  { name: 'Philosophy', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300' },
  { name: 'Engineering', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  { name: 'Other', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300' },
];

export function getSubjectColor(subject) {
  const found = SUBJECTS.find((s) => s.name.toLowerCase() === subject?.toLowerCase());
  return found?.color || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

export function getPostTypeIcon(type) {
  switch (type) {
    case 'pdf': return '📄';
    case 'image': return '🖼️';
    case 'youtube_video': return '🎬';
    case 'youtube_playlist': return '📺';
    default: return '📝';
  }
}

export function getPostTypeLabel(type) {
  switch (type) {
    case 'pdf': return 'PDF';
    case 'image': return 'Image';
    case 'youtube_video': return 'Video';
    case 'youtube_playlist': return 'Playlist';
    default: return 'Post';
  }
}

export function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString();
}

export function extractYoutubeInfo(url) {
  // Video patterns
  const videoPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of videoPatterns) {
    const match = url.match(pattern);
    if (match) return { id: match[1], type: 'youtube_video' };
  }
  // Playlist
  const playlistPattern = /[?&]list=([a-zA-Z0-9_-]+)/;
  const playlistMatch = url.match(playlistPattern);
  if (playlistMatch) return { id: playlistMatch[1], type: 'youtube_playlist' };
  return null;
}
