import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import logoImg from '../assets/logo.png';
import { HiLockClosed, HiMail, HiArrowLeft } from 'react-icons/hi';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter your email address.');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setSent(true);
      toast.success('Password reset link sent! Check your email.');
    } catch (err) {
      // Don't reveal whether email exists for security
      if (err.message?.includes('rate limit')) {
        toast.error('Too many requests. Please wait a few minutes.');
      } else {
        // Still show success to prevent email enumeration
        setSent(true);
        toast.success('If this email is registered, you will receive a reset link.');
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
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-ig-bg-2 dark:bg-ig-bg-elevated border-2 border-ig-text dark:border-ig-text-light flex items-center justify-center mx-auto mb-4">
              <HiLockClosed className="w-10 h-10 text-ig-text dark:text-ig-text-light" />
            </div>
            <h2 className="text-base font-semibold text-ig-text dark:text-ig-text-light">
              Trouble logging in?
            </h2>
            <p className="text-xs text-ig-text-2 mt-2 leading-relaxed">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ig-text-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field text-xs !py-2.5 pl-10"
                  placeholder="Email address"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="btn-primary w-full text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <HiMail className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ig-text dark:text-ig-text-light">Email sent!</p>
                <p className="text-xs text-ig-text-2 mt-1 leading-relaxed">
                  Check your inbox for <span className="font-semibold">{email}</span> and click the reset link.
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-ig-primary text-xs font-semibold hover:text-ig-primary-hover"
              >
                Didn't receive it? Try again
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-ig-separator dark:bg-ig-separator-dark" />
            <span className="text-xs text-ig-text-2 font-semibold uppercase">Or</span>
            <div className="flex-1 h-px bg-ig-separator dark:bg-ig-separator-dark" />
          </div>

          <Link to="/register" className="block text-center text-sm font-semibold text-ig-text dark:text-ig-text-light hover:opacity-70">
            Create new account
          </Link>
        </div>

        {/* Back to Login Card */}
        <div className="card p-5 text-center">
          <Link to="/login" className="text-sm font-semibold text-ig-text dark:text-ig-text-light hover:opacity-70 flex items-center justify-center gap-2">
            <HiArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
