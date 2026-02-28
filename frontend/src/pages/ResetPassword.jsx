import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { HiLockClosed, HiEye, HiEyeOff, HiCheckCircle } from 'react-icons/hi';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event when user arrives via reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setSessionReady(true);
          setChecking(false);
        } else if (event === 'SIGNED_IN' && session) {
          // Also handle if session is already established
          setSessionReady(true);
          setChecking(false);
        }
      }
    );

    // Check if there's already a valid session (user may have refreshed the page)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      }
      setChecking(false);
    };

    // Give Supabase a moment to process the URL hash tokens
    const timer = setTimeout(checkSession, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return toast.error('Please fill in both fields.');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success('Password updated successfully!');
      // Sign out so user can log in with new password
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Password update error:', err);
      if (err.message?.includes('same password')) {
        toast.error('New password must be different from the old one.');
      } else {
        toast.error(err.message || 'Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking for recovery session
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ig-bg-2 dark:bg-ig-bg-dark px-4">
        <div className="w-full max-w-[350px]">
          <div className="card px-10 py-10 text-center">
            <div className="w-8 h-8 border-2 border-ig-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-ig-text-2">Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  // No valid session — invalid or expired link
  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ig-bg-2 dark:bg-ig-bg-dark px-4">
        <div className="w-full max-w-[350px] space-y-3">
          <div className="card px-10 py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <HiLockClosed className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-ig-text dark:text-ig-text-light mb-2">
              Invalid or expired link
            </h2>
            <p className="text-xs text-ig-text-2 leading-relaxed mb-4">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="btn-primary inline-block text-sm px-6 py-2"
            >
              Request new link
            </Link>
          </div>
          <div className="card p-5 text-center">
            <Link to="/login" className="text-sm font-semibold text-ig-text dark:text-ig-text-light hover:opacity-70">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ig-bg-2 dark:bg-ig-bg-dark px-4">
      <div className="w-full max-w-[350px] space-y-3">
        <div className="card px-10 pt-10 pb-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-ig-bg-2 dark:bg-ig-bg-elevated border-2 border-ig-text dark:border-ig-text-light flex items-center justify-center mx-auto mb-4">
              {success ? (
                <HiCheckCircle className="w-10 h-10 text-green-500" />
              ) : (
                <HiLockClosed className="w-10 h-10 text-ig-text dark:text-ig-text-light" />
              )}
            </div>
            <h2 className="text-base font-semibold text-ig-text dark:text-ig-text-light">
              {success ? 'Password Updated!' : 'Set new password'}
            </h2>
            {!success && (
              <p className="text-xs text-ig-text-2 mt-2 leading-relaxed">
                Enter your new password below. Make it at least 6 characters.
              </p>
            )}
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field text-xs !py-2.5 pr-10"
                  placeholder="New password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ig-text-2 hover:text-ig-text dark:hover:text-ig-text-light"
                >
                  {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field text-xs !py-2.5"
                placeholder="Confirm new password"
              />

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="btn-primary w-full text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-xs text-ig-text-2 leading-relaxed">
                Your password has been updated successfully. You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary w-full text-sm"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
