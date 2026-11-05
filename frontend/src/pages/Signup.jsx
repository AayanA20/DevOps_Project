import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Lock, Mail, User, FileText, Image as ImageIcon } from 'lucide-react';
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
    <div className="min-h-screen bg-instagram-bg flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-sm space-y-4">
        {/* Main Card */}
        <div className="bg-white border border-instagram-border p-8 rounded-xl shadow-sm text-center">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow">
              <Camera className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">
              Mini Instagram
            </h1>
          </div>

          <p className="text-xs text-instagram-secondary mb-6 font-medium">
            Sign up to see photos and videos from your friends.
          </p>

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
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-instagram-border rounded-md focus:bg-white focus:outline-none focus:border-gray-400 text-gray-800 placeholder-gray-400"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
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
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-instagram-border rounded-md focus:bg-white focus:outline-none focus:border-gray-400 text-gray-800 placeholder-gray-400"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
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
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-instagram-border rounded-md focus:bg-white focus:outline-none focus:border-gray-400 text-gray-800 placeholder-gray-400"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
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
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-instagram-border rounded-md focus:bg-white focus:outline-none focus:border-gray-400 text-gray-800 placeholder-gray-400"
                />
                <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
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
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-instagram-border rounded-md focus:bg-white focus:outline-none focus:border-gray-400 text-gray-800 placeholder-gray-400"
                />
                <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-instagram-blue hover:bg-instagram-hoverBlue disabled:bg-blue-300 text-white font-semibold text-xs rounded-md shadow-sm transition-colors flex items-center justify-center mt-2"
            >
              {loading ? <LoadingSpinner size="small" text="" /> : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Switch to Login Card */}
        <div className="bg-white border border-instagram-border p-4 rounded-xl text-center text-xs">
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

