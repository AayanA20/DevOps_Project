import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Camera, Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('tester@university.edu');
    setPassword('DevopsPass123!');
    setError('');
    setLoading(true);
    try {
      await login({ email: 'tester@university.edu', password: 'DevopsPass123!' });
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Demo user not registered yet. Please create an account.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-amber-50/30 to-purple-50/40 flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] bg-gradient-to-tr from-pink-400/15 via-rose-400/15 to-amber-300/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-4 relative z-10">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200/90 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] text-center transition-all">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl story-ring p-[2.5px] shadow-[0_6px_20px_rgba(225,48,108,0.35)] mb-3">
              <div className="w-full h-full bg-white rounded-[13px] flex items-center justify-center">
                <Camera className="w-7 h-7 text-instagram-storyPink" />
              </div>
            </div>
            <h1 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">
              Mini Instagram
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
              Sign in to view photos, connect with friends, and share your moments.
            </p>
          </div>

          <ErrorMessage message={error} />

          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            <div>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50/90 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-instagram-blue focus:ring-2 focus:ring-blue-100 text-gray-800 placeholder-gray-400 transition-all"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50/90 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-instagram-blue focus:ring-2 focus:ring-blue-100 text-gray-800 placeholder-gray-400 transition-all"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 px-4 bg-instagram-blue hover:bg-instagram-hoverBlue disabled:bg-blue-300 text-white font-semibold text-xs rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center space-x-1.5 active:scale-[0.99]"
            >
              {loading ? (
                <LoadingSpinner size="small" text="" />
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center justify-center space-x-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              OR
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Quick Demo Login Option */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 px-3.5 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-600/10 hover:from-amber-500/15 hover:via-rose-500/15 hover:to-purple-600/15 border border-rose-200/80 text-rose-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>One-Click Test Account</span>
          </button>
        </div>

        {/* Switch to Signup Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200/90 p-4 rounded-2xl text-center text-xs shadow-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/signup" className="font-semibold text-instagram-blue hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
