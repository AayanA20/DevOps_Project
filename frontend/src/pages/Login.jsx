import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Camera, Lock, Mail } from 'lucide-react';
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
    setEmail('demo@instagram.test');
    setPassword('demo123456');
    setError('');
    setLoading(true);
    try {
      await login({ email: 'demo@instagram.test', password: 'demo123456' });
      navigate(from, { replace: true });
    } catch (err) {
      // If demo user does not exist yet, prompt to sign up or use standard credentials
      setError(
        err.response?.data?.message || 'Demo user not registered yet. Please create an account.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-instagram-bg flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-sm space-y-4">
        {/* Main Card */}
        <div className="bg-white border border-instagram-border p-8 rounded-xl shadow-sm text-center">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow">
              <Camera className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">
              Mini Instagram
            </h1>
          </div>

          <p className="text-xs text-instagram-secondary mb-6">
            Sign in to view photos and updates from your friends.
          </p>

          <ErrorMessage message={error} />

          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            <div>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-instagram-border rounded-md focus:bg-white focus:outline-none focus:border-gray-400 text-gray-800 placeholder-gray-400"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
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
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-instagram-border rounded-md focus:bg-white focus:outline-none focus:border-gray-400 text-gray-800 placeholder-gray-400"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2 px-4 bg-instagram-blue hover:bg-instagram-hoverBlue disabled:bg-blue-300 text-white font-semibold text-xs rounded-md shadow-sm transition-colors flex items-center justify-center"
            >
              {loading ? <LoadingSpinner size="small" text="" /> : 'Log In'}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="text-xs text-instagram-blue hover:underline font-semibold"
            >
              Log in with Demo Account
            </button>
          </div>
        </div>

        {/* Switch to Signup Card */}
        <div className="bg-white border border-instagram-border p-4 rounded-xl text-center text-xs">
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
