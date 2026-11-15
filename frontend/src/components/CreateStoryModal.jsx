import React, { useState } from 'react';
import { X, Sparkles, Image as ImageIcon, Camera, Loader2, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { storyService } from '../services/storyService';
import ErrorMessage from './ErrorMessage';

const PRESET_STORIES = [
  {
    label: 'Sunset Beach',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
    caption: 'Golden hour at the beach 🌅🌊',
  },
  {
    label: 'Dev Setup',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    caption: 'Shipping microservices & DevOps pipelines 💻🐳',
  },
  {
    label: 'Coffee Time',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop',
    caption: 'Fuel for late-night coding ☕✨',
  },
  {
    label: 'City Skyline',
    url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&auto=format&fit=crop',
    caption: 'City lights never sleep 🏙️🌃',
  },
  {
    label: 'Concert Vibe',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop',
    caption: 'Live music & incredible energy 🎶🔥',
  },
];

const CreateStoryModal = ({ isOpen, onClose, onStoryCreated }) => {
  const { user } = useAuth();
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (preset) => {
    setMediaUrl(preset.url);
    if (!caption.trim()) {
      setCaption(preset.caption);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mediaUrl.trim()) {
      setError('Please provide an image URL for your story');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await storyService.createStory({
        mediaUrl: mediaUrl.trim(),
        caption: caption.trim(),
      });

      setMediaUrl('');
      setCaption('');
      if (onStoryCreated) {
        onStoryCreated(res.story);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create story:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to publish story'
      );
    } finally {
      setLoading(false);
    }
  };

  const userAvatar =
    user?.profilePicture ||
    `https://ui-avatars.com/api/?name=${user?.username || 'You'}&background=random`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col md:flex-row max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Live Vertical Story Preview */}
        <div className="w-full md:w-5/12 bg-zinc-950 p-6 flex flex-col items-center justify-center relative overflow-hidden text-white border-b md:border-b-0 md:border-r border-zinc-800">
          <p className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase mb-3 self-start">
            Story Preview
          </p>

          <div className="relative w-48 h-80 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-zinc-900 flex flex-col justify-between">
            {/* Top Bar on Preview */}
            <div className="p-3 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center space-x-2">
              <img
                src={userAvatar}
                alt={user?.username || 'You'}
                className="w-6 h-6 rounded-full border border-white object-cover"
              />
              <span className="text-[11px] font-bold text-white truncate max-w-[90px]">
                {user?.username || 'Your story'}
              </span>
              <span className="text-[9px] text-white/70">Just now</span>
            </div>

            {/* Media Image or Placeholder */}
            {mediaUrl ? (
              <img
                src={mediaUrl}
                alt="Story preview"
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setError('Image failed to load. Please verify the URL.')}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-zinc-500">
                <Camera className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs">Select a preset or paste an image URL</span>
              </div>
            )}

            {/* Caption Overlay */}
            {caption && (
              <div className="p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10">
                <p className="text-xs text-white font-medium drop-shadow-md text-center line-clamp-2">
                  {caption}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400 mt-4">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Story expires in 24 hours</span>
          </div>
        </div>

        {/* Right Side: Form & Presets */}
        <div className="w-full md:w-7/12 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg story-ring p-[2px] flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-[6px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-900">Add to Story</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <ErrorMessage message={error} />

              {/* Image URL Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Story Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={mediaUrl}
                    onChange={(e) => {
                      setMediaUrl(e.target.value);
                      setError('');
                    }}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Or select a quick story
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_STORIES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        mediaUrl === preset.url
                          ? 'bg-rose-50 border-rose-400 text-rose-700 font-bold shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Story Caption (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={150}
                  placeholder="Add a message or text overlay..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 resize-none transition-all placeholder:text-gray-400"
                />
                <div className="text-right text-[10px] text-gray-400">
                  {caption.length}/150
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-black rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !mediaUrl.trim()}
                  className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      <span>Share to Story</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStoryModal;
