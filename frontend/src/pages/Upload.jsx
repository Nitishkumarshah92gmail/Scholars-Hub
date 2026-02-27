import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost, uploadFiles } from '../api';
import { SUBJECTS } from '../utils';
import toast from 'react-hot-toast';
import {
  HiDocumentText,
  HiPhotograph,
  HiPlay,
  HiCollection,
  HiX,
  HiUpload,
  HiLink,
  HiCloudUpload,
} from 'react-icons/hi';

const TYPES = [
  { value: 'pdf', label: 'PDF', icon: HiDocumentText },
  { value: 'image', label: 'Images', icon: HiPhotograph },
  { value: 'youtube_video', label: 'Video', icon: HiPlay },
  { value: 'youtube_playlist', label: 'Playlist', icon: HiCollection },
  { value: 'drive_link', label: 'Drive Link', icon: HiCloudUpload },
];

export default function Upload() {
  const navigate = useNavigate();
  const [type, setType] = useState('pdf');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (type === 'pdf') {
      setFiles(selected.slice(0, 1));
    } else {
      setFiles((prev) => [...prev, ...selected].slice(0, 5));
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFilesToDrive = async () => {
    setUploadProgress('Uploading to Google Drive...');
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('subfolder', type === 'pdf' ? 'pdfs' : 'images');

    const res = await uploadFiles(formData);
    setUploadProgress('');
    return res.data.urls;
  };

  /**
   * Convert various Google Drive URL formats to an embeddable/viewable URL.
   */
  const normalizeDriveUrl = (url) => {
    // Extract file ID from various Drive URL formats
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,                    // /d/FILE_ID
      /id=([a-zA-Z0-9_-]+)/,                       // ?id=FILE_ID
      /\/file\/d\/([a-zA-Z0-9_-]+)/,               // /file/d/FILE_ID
      /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/, // /open?id=FILE_ID
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }
    return url; // Return as-is if no pattern matches
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required.');
    if (!subject) return toast.error('Please select a subject.');
    if ((type === 'youtube_video' || type === 'youtube_playlist') && !youtubeUrl) {
      return toast.error('YouTube URL is required.');
    }
    if (type === 'drive_link' && !driveUrl) {
      return toast.error('Google Drive link is required.');
    }
    if ((type === 'pdf' || type === 'image') && files.length === 0) {
      return toast.error('Please select a file.');
    }
    setLoading(true);
    try {
      let fileUrl = '';
      let fileUrls = [];
      let postType = type;

      if (type === 'pdf' || type === 'image') {
        const driveResults = await uploadFilesToDrive();
        fileUrl = driveResults[0]?.fileUrl || '';
        fileUrls = driveResults.map((r) => r.fileUrl);
      } else if (type === 'drive_link') {
        fileUrl = normalizeDriveUrl(driveUrl.trim());
        fileUrls = [fileUrl];
        // Detect the content type from the URL for proper rendering
        const lowerUrl = driveUrl.toLowerCase();
        if (lowerUrl.includes('.pdf')) {
          postType = 'pdf';
        } else {
          postType = 'image'; // Default to image for Drive links
        }
      }

      await createPost({
        type: postType,
        title: title.trim(),
        description: description.trim(),
        subject,
        youtubeUrl: type === 'youtube_video' || type === 'youtube_playlist' ? youtubeUrl : undefined,
        fileUrl,
        fileUrls,
      });
      toast.success('Post shared!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-ig-text dark:text-ig-text-light mb-4">
        Create new post
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content Type */}
        <div className="card p-4">
          <p className="text-sm font-semibold text-ig-text dark:text-ig-text-light mb-3">Content type</p>
          <div className="grid grid-cols-5 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => { setType(t.value); setFiles([]); setYoutubeUrl(''); setDriveUrl(''); }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg text-center transition-all ${type === t.value
                    ? 'bg-ig-primary/10 border border-ig-primary text-ig-primary'
                    : 'border border-ig-separator dark:border-ig-separator-dark text-ig-text-2 hover:border-ig-text-2'
                  }`}
              >
                <t.icon className="w-5 h-5" />
                <span className="text-[11px] font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Input */}
        <div className="card p-4">
          {type === 'drive_link' ? (
            <div>
              <p className="text-sm font-semibold text-ig-text dark:text-ig-text-light mb-2">Google Drive Link</p>
              <p className="text-xs text-ig-text-2 mb-3">Paste a shared Google Drive link to a PDF, image, or any file</p>
              <div className="relative">
                <HiCloudUpload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ig-text-2" />
                <input
                  type="url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  className="input-field pl-10 text-sm"
                  placeholder="https://drive.google.com/file/d/..."
                />
              </div>
              <p className="text-[11px] text-ig-text-2 mt-2">
                💡 Make sure the file sharing is set to "Anyone with the link" in Google Drive
              </p>
            </div>
          ) : (type === 'youtube_video' || type === 'youtube_playlist') ? (
            <div>
              <p className="text-sm font-semibold text-ig-text dark:text-ig-text-light mb-2">YouTube URL</p>
              <div className="relative">
                <HiLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ig-text-2" />
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="input-field pl-10 text-sm"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="border border-dashed border-ig-separator dark:border-ig-separator-dark rounded-lg p-8 text-center hover:border-ig-primary transition-colors">
                <HiUpload className="w-8 h-8 text-ig-text-2 mx-auto mb-2" />
                <p className="text-sm text-ig-text-2 mb-2">
                  {type === 'pdf' ? 'Drop your PDF here' : 'Drop images here'}
                </p>
                <p className="text-xs text-ig-text-2 mb-3">Files will be stored on Google Drive</p>
                <input
                  type="file"
                  accept={type === 'pdf' ? '.pdf' : 'image/*'}
                  multiple={type === 'image'}
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="btn-primary text-xs cursor-pointer inline-block px-4 py-2">
                  Select from computer
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-ig-bg-2 dark:bg-ig-bg-elevated rounded-lg p-2.5">
                      <span className="text-lg">{type === 'pdf' ? '📄' : '🖼️'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-ig-text dark:text-ig-text-light">{file.name}</p>
                        <p className="text-[10px] text-ig-text-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button type="button" onClick={() => removeFile(index)} className="text-ig-text-2 hover:text-ig-error">
                        <HiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="card p-4 space-y-3">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field text-sm"
              placeholder="Write a caption... (title)"
              maxLength={200}
            />
          </div>
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[80px] resize-y text-sm"
              placeholder="Add a description..."
              maxLength={2000}
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-ig-text dark:text-ig-text-light mb-2">Subject</p>
            <div className="flex flex-wrap gap-1.5">
              {SUBJECTS.filter((s) => s.name !== 'Other').map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setSubject(s.name)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${subject === s.name
                      ? 'bg-ig-primary text-white'
                      : 'bg-ig-bg-2 dark:bg-ig-bg-elevated text-ig-text-2 hover:text-ig-text'
                    }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="btn-primary w-full text-sm py-3">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {uploadProgress || 'Sharing...'}
            </span>
          ) : (
            'Share'
          )}
        </button>
      </form>
    </div>
  );
}
