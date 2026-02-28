import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUser, updateUser, uploadAvatar, getTotalUsers } from '../api';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import { SUBJECTS, getSubjectColor } from '../utils';
import toast from 'react-hot-toast';
import { HiPencil, HiX, HiCamera, HiUserGroup } from 'react-icons/hi';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, updateUserData } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getUser(id),
      getTotalUsers().catch(() => ({ data: { totalUsers: 0 } })),
    ])
      .then(([res, statsRes]) => {
        setProfile(res.data.user);
        setPosts(res.data.posts);
        setTotalUsers(statsRes.data.totalUsers || 0);
        setEditForm({
          name: res.data.user.name,
          bio: res.data.user.bio || '',
          school: res.data.user.school || '',
          subjects: res.data.user.subjects || [],
        });
      })
      .catch(() => toast.error('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [id, currentUser?._id]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let avatarUrl = profile.avatar;
      if (editForm.avatarFile) {
        const formData = new FormData();
        formData.append('avatar', editForm.avatarFile);
        const uploadRes = await uploadAvatar(formData);
        avatarUrl = uploadRes.data.fileUrl;
      }
      const res = await updateUser(id, {
        name: editForm.name,
        bio: editForm.bio,
        school: editForm.school,
        subjects: editForm.subjects,
        avatar: avatarUrl,
      });
      setProfile(res.data);
      updateUserData(res.data);
      setEditing(false);
      toast.success('Profile saved!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-8 mb-8 animate-pulse">
          <div className="w-20 h-20 sm:w-36 sm:h-36 rounded-full skeleton" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-32 skeleton" />
            <div className="h-4 w-48 skeleton" />
            <div className="h-4 w-40 skeleton" />
          </div>
        </div>
        <PostSkeleton />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl block mb-4">😕</span>
        <h3 className="text-base font-semibold text-ig-text dark:text-ig-text-light">
          This page isn't available
        </h3>
        <p className="text-sm text-ig-text-2 mt-2">
          The link you followed may be broken, or the user may have been removed.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Profile Header — Instagram-style */}
      <div className="flex items-start gap-6 sm:gap-12 mb-8">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="avatar-ring p-[3px]">
              <img
                src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&size=200`}
                alt={profile.name}
                className="w-20 h-20 sm:w-36 sm:h-36 rounded-full object-cover"
              />
            </div>
            {isOwnProfile && editing && (
              <label className="absolute bottom-1 right-1 bg-ig-primary text-white p-2 rounded-full cursor-pointer hover:bg-ig-primary-hover transition-colors shadow-lg">
                <HiCamera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setEditForm((prev) => ({ ...prev, avatarFile: e.target.files[0] }))}
                />
              </label>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 pt-2">
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <h1 className="text-xl font-normal text-ig-text dark:text-ig-text-light">
              {profile.name}
            </h1>
            {isOwnProfile && (
              <button onClick={() => setEditing(!editing)} className="btn-outline text-sm flex items-center gap-1.5 py-1.5 px-4">
                {editing ? <HiX className="w-4 h-4" /> : <HiPencil className="w-4 h-4" />}
                {editing ? 'Cancel' : 'Edit profile'}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mb-4">
            <div><span className="font-semibold text-ig-text dark:text-ig-text-light">{posts.length}</span> <span className="text-ig-text-2 text-sm">posts</span></div>
            <div className="flex items-center gap-1.5">
              <HiUserGroup className="w-4 h-4 text-ig-primary" />
              <span className="font-semibold text-ig-text dark:text-ig-text-light">{totalUsers}</span> <span className="text-ig-text-2 text-sm">scholars on platform</span>
            </div>
          </div>

          {/* Bio */}
          <div className="text-sm">
            <p className="font-semibold text-ig-text dark:text-ig-text-light">{profile.name}</p>
            {profile.school && <p className="text-ig-text-2">🏫 {profile.school}</p>}
            {profile.bio && <p className="text-ig-text dark:text-ig-text-light mt-1 whitespace-pre-wrap">{profile.bio}</p>}
          </div>

          {/* Subject tags */}
          {profile.subjects?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.subjects.map((s) => (
                <span key={s} className={`subject-badge text-[10px] ${getSubjectColor(s)}`}>{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="card p-5 mb-6 animate-fade-in">
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ig-text dark:text-ig-text-light mb-1">Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ig-text dark:text-ig-text-light mb-1">School</label>
                <input type="text" value={editForm.school} onChange={(e) => setEditForm((prev) => ({ ...prev, school: e.target.value }))} className="input-field text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ig-text dark:text-ig-text-light mb-1">Bio</label>
              <textarea value={editForm.bio} onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))} className="input-field min-h-[70px] text-sm" maxLength={300} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ig-text dark:text-ig-text-light mb-2">Subjects</label>
              <div className="flex flex-wrap gap-1.5">
                {SUBJECTS.filter((s) => s.name !== 'Other').map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setEditForm((prev) => ({ ...prev, subjects: prev.subjects.includes(s.name) ? prev.subjects.filter((x) => x !== s.name) : [...prev.subjects, s.name] }))}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${editForm.subjects?.includes(s.name) ? 'bg-ig-primary text-white' : 'bg-ig-bg-2 dark:bg-ig-bg-elevated text-ig-text-2'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Submit
            </button>
          </form>
        </div>
      )}

      {/* Posts Grid divider — Instagram-style */}
      <div className="border-t border-ig-separator dark:border-ig-separator-dark pt-4">
        <div className="flex justify-center gap-12 mb-4 text-xs font-semibold uppercase tracking-widest">
          <span className="text-ig-text dark:text-ig-text-light border-t border-ig-text dark:border-ig-text-light pt-4 -mt-4">
            Posts
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <HiCamera className="w-16 h-16 text-ig-text-2 mx-auto mb-4 opacity-30" />
            <h3 className="text-2xl font-light text-ig-text dark:text-ig-text-light mb-2">
              No Posts Yet
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
