import React, { useState } from 'react';
import { X, Camera, Lock, Globe, Sparkles } from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop',
];

const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const { user, updateUser } = useAuth();
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [isPrivate, setIsPrivate] = useState(Boolean(user?.isPrivate));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await userService.updateProfile({
        bio: bio.trim(),
        profilePicture: profilePicture.trim(),
        isPrivate,
      });

      if (res.user) {
        updateUser({ ...user, ...res.user });
      }

      if (onProfileUpdated) {
        onProfileUpdated(res.user);
      }

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const previewAvatar =
    profilePicture ||
    `https://ui-avatars.com/api/?name=${user?.username || 'User'}&size=150&background=random`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 mx-auto">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <ErrorMessage message={error} />

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer mb-2">
              <div className="w-20 h-20 rounded-full story-ring p-[2.5px] shadow-sm">
                <img
                  src={previewAvatar}
                  alt={user?.username}
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-900">{user?.username}</p>
          </div>

          {/* Avatar URL Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Profile Photo URL
            </label>
            <input
              type="url"
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
              placeholder="Paste custom photo or avatar link..."
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-instagram-blue focus:ring-1 focus:ring-instagram-blue transition-all"
            />
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="flex items-center text-[10px] text-gray-400 flex-shrink-0">
                <Sparkles className="w-3 h-3 mr-1 text-amber-500" /> Presets:
              </span>
              {SAMPLE_AVATARS.map((url, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setProfilePicture(url)}
                  className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 hover:scale-110 transition-transform"
                >
                  <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Bio Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your friends about yourself..."
              maxLength={200}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-instagram-blue focus:ring-1 focus:ring-instagram-blue transition-all resize-none text-gray-800"
            />
            <div className="text-right text-[10px] text-gray-400 mt-0.5">
              {bio.length} / 200
            </div>
          </div>

          {/* Account Privacy Toggle (Public vs Private) */}
          <div className="p-3.5 bg-gray-50/90 border border-gray-200/80 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                {isPrivate ? (
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <Lock className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-instagram-blue">
                    <Globe className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    {isPrivate ? 'Private Account' : 'Public Account'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {isPrivate
                      ? 'Only approved followers can see your posts.'
                      : 'Anyone can follow you and view your posts.'}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-instagram-blue" />
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-instagram-blue hover:bg-instagram-hoverBlue disabled:bg-blue-300 rounded-xl shadow-sm transition-all"
            >
              {loading ? <LoadingSpinner size="small" text="" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;

