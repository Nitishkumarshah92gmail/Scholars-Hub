import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SUBJECTS } from '../utils';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    school: '',
    subjects: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleSubject = (subject) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return toast.error('Name, email, and password are required.');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      const profile = await registerUser(form);
      if (profile) {
        toast.success('Welcome to Scholars Hub!');
        navigate('/dashboard');
      } else {
        toast.success('Check your email to confirm your account!', { duration: 6000 });
        navigate('/login');
      }
    } catch (err) {
      const msg = err.message || 'Registration failed.';
      if (msg.toLowerCase().includes('rate limit')) {
        toast.error('Too many signup attempts. Please wait a few minutes and try again.', { duration: 6000 });
      } else if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered')) {
        toast.error('This email is already registered. Try signing in instead.');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ig-bg-2 dark:bg-ig-bg-dark px-4 py-8">
      <div className="w-full max-w-[350px] space-y-3">
        {/* Main Card */}
        <div className="card px-10 pt-8 pb-6">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-heading font-bold text-ig-text dark:text-ig-text-light flex items-center justify-center gap-2">
              <img src="/src/assets/logo.png" alt="Scholars Hub" className="w-10 h-10 rounded-full object-cover" />
              Scholars<span className="gradient-text"> Hub</span>
            </h1>
            <p className="text-ig-text-2 text-sm mt-2 font-semibold">
              Sign up to share study materials with friends.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-field text-xs !py-2.5"
              placeholder="Full Name"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field text-xs !py-2.5"
              placeholder="Email address"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-field text-xs !py-2.5 pr-14"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ig-text-2 hover:text-ig-text dark:hover:text-ig-text-light text-sm font-semibold"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type="text"
              name="school"
              value={form.school}
              onChange={handleChange}
              className="input-field text-xs !py-2.5"
              placeholder="School / University (optional)"
            />

            {/* Subject Selection */}
            <div className="pt-2">
              <p className="text-xs text-ig-text-2 mb-2 font-medium">Subjects you're interested in</p>
              <div className="flex flex-wrap gap-1.5">
                {SUBJECTS.filter((s) => s.name !== 'Other').map((subject) => (
                  <button
                    key={subject.name}
                    type="button"
                    onClick={() => toggleSubject(subject.name)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${form.subjects.includes(subject.name)
                      ? 'bg-ig-primary text-white'
                      : 'bg-ig-bg-2 dark:bg-ig-bg-elevated text-ig-text-2 hover:text-ig-text dark:hover:text-ig-text-light'
                      }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-3 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Sign up'
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-ig-text-2 mt-4 leading-4">
            By signing up, you agree to share knowledge and help fellow students learn.
          </p>
        </div>

        {/* Log In Card */}
        <div className="card p-5 text-center">
          <p className="text-sm text-ig-text dark:text-ig-text-light">
            Have an account?{' '}
            <Link to="/login" className="text-ig-primary font-semibold hover:text-ig-primary-hover">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
