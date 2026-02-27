import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import logoImg from '../assets/logo.png';
import { HiEye, HiEyeOff } from 'react-icons/hi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields.');
    setLoading(true);
    try {
      await loginUser(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message || 'Login failed.';
      if (msg.toLowerCase().includes('invalid login')) {
        toast.error('Invalid email or password. Please try again.');
      } else if (msg.toLowerCase().includes('rate limit')) {
        toast.error('Too many login attempts. Please wait a few minutes.', { duration: 6000 });
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        toast.error('Please confirm your email before logging in.');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ig-bg-2 dark:bg-ig-bg-dark px-4">
      <div className="w-full max-w-[350px] space-y-3">
        {/* Main Card */}
        <div className="card px-10 pt-10 pb-6">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-ig-text dark:text-ig-text-light flex items-center justify-center gap-2">
              <img src={logoImg} alt="Scholars Hub" className="w-10 h-10 rounded-full object-cover" />
              Scholars<span className="gradient-text"> Hub</span>
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field text-xs !py-2.5"
              placeholder="Email address"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field text-xs !py-2.5 pr-10"
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

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full mt-3 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Log in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-ig-separator dark:bg-ig-separator-dark" />
            <span className="text-xs text-ig-text-2 font-semibold uppercase">Or</span>
            <div className="flex-1 h-px bg-ig-separator dark:bg-ig-separator-dark" />
          </div>

          <p className="text-center text-xs text-ig-text-2">
            Welcome to Scholars Hub — learn together, grow together.
          </p>
        </div>

        {/* Sign Up Card */}
        <div className="card p-5 text-center">
          <p className="text-sm text-ig-text dark:text-ig-text-light">
            Don't have an account?{' '}
            <Link to="/register" className="text-ig-primary font-semibold hover:text-ig-primary-hover">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
