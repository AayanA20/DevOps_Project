import React, { useState } from 'react';
import { X, Image as ImageIcon, Sparkles, Upload } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setError('Please provide an image URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({ imageUrl: imageUrl.trim(), caption: caption.trim() });
      setImageUrl('');
      setCaption('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const sampleImages = [
    { label: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop' },
    { label: 'Mountains', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop' },
    { label: 'Forest', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop' },
    { label: 'City', url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&auto=format&fit=crop' },
    { label: 'Tech', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg story-ring p-[1px] flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[7px] flex items-center justify-center">
                <Upload className="w-3.5 h-3.5 text-rose-500" />
              </div>
            </div>
            <h2 className="text-sm font-bold text-gray-900">Create new post</h2>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <ErrorMessage message={error} />

          {/* Image URL Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Image URL / Media Link
            </label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste any photo URL or Cloudinary link..."
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-instagram-blue focus:ring-2 focus:ring-blue-100 transition-all text-gray-800"
            />

            {/* Quick Sample Selector */}
            <div className="mt-2.5">
              <span className="flex items-center text-[11px] font-semibold text-gray-500 mb-1.5">
                <Sparkles className="w-3 h-3 mr-1 text-amber-500" /> Quick Samples:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                {sampleImages.map((item, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setImageUrl(item.url)}
                    className="flex items-center space-x-1 px-2.5 py-1 text-[11px] bg-gray-50 hover:bg-rose-50 hover:text-rose-600 rounded-lg border border-gray-200 transition-all flex-shrink-0"
                  >
                    <img src={item.url} alt={item.label} className="w-3.5 h-3.5 rounded object-cover" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Container */}
          <div className="border border-dashed border-gray-300 rounded-2xl h-48 flex items-center justify-center bg-gray-50/80 overflow-hidden relative group">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setError('Invalid image URL or failed to load image')}
              />
            ) : (
              <div className="text-center text-gray-400 p-4">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-medium">Selected image preview will appear here</p>
              </div>
            )}
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Caption
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption... (e.g. Sunset in Mumbai 🌅 #travel #goldenhour)"
              maxLength={500}
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-instagram-blue focus:ring-2 focus:ring-blue-100 transition-all resize-none text-gray-800"
            />
            <div className="text-right text-[10px] text-gray-400 mt-1">
              {caption.length} / 500
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !imageUrl.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-instagram-blue hover:bg-instagram-hoverBlue disabled:bg-blue-300 rounded-xl shadow-sm transition-all flex items-center space-x-1 active:scale-95"
            >
              {loading ? <LoadingSpinner size="small" text="" /> : <span>Share Post</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
