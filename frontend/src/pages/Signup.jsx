import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Lock, Mail, User, FileText, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
    profilePicture: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in username, email and password');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Registration failed. Try a different username/email.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-amber-50/30 to-purple-50/40 flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-gradient-to-tr from-pink-400/15 via-rose-400/15 to-amber-300/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-4 relative z-10">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200/90 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] text-center transition-all">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl story-ring p-[2.5px] shadow-[0_6px_20px_rgba(225,48,108,0.35)] mb-3">
              <div className="w-full h-full bg-white rounded-[13px] flex items-center justify-center">
                <Camera className="w-7 h-7 text-instagram-storyPink" />
              </div>
            </div>
            <h1 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">
              Mini Instagram
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
              Sign up to see photos and videos from your friends and creators.
            </p>
          </div>

          <ErrorMessage message={error} />

          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            <div>
              <div className="relative">
                <input
                  type="text"
                  required
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50/90 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-instagram-blue focus:ring-2 focus:ring-blue-100 text-gray-800 placeholder-gray-400 transition-all"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  placeholder="Password (min 6 chars)"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50/90 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-instagram-blue focus:ring-2 focus:ring-blue-100 text-gray-800 placeholder-gray-400 transition-all"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  type="text"
                  name="bio"
                  placeholder="Bio (optional)"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50/90 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-instagram-blue focus:ring-2 focus:ring-blue-100 text-gray-800 placeholder-gray-400 transition-all"
                />
                <FileText className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  type="url"
                  name="profilePicture"
                  placeholder="Profile Picture URL (optional)"
                  value={formData.profilePicture}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50/90 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-instagram-blue focus:ring-2 focus:ring-blue-100 text-gray-800 placeholder-gray-400 transition-all"
                />
                <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-instagram-blue hover:bg-instagram-hoverBlue disabled:bg-blue-300 text-white font-semibold text-xs rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center space-x-1.5 active:scale-[0.99] mt-3"
            >
              {loading ? (
                <LoadingSpinner size="small" text="" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Switch to Login Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200/90 p-4 rounded-2xl text-center text-xs shadow-sm">
          <span className="text-gray-600">Have an account? </span>
          <Link to="/login" className="font-semibold text-instagram-blue hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
