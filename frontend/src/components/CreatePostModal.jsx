import React, { useState } from 'react';
import { X, Image as ImageIcon, Sparkles } from 'lucide-react';
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
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-instagram-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-instagram-border">
          <h2 className="text-sm font-semibold text-gray-900 mx-auto">Create new post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <ErrorMessage message={error} />

          {/* Image URL Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Image URL / Media Link
            </label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg or Cloudinary URL"
              className="w-full px-3 py-2 text-sm border border-instagram-border rounded-md focus:outline-none focus:border-instagram-blue focus:ring-1 focus:ring-instagram-blue"
            />
            {/* Quick Sample Selector */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto text-xs text-instagram-secondary">
              <span className="flex items-center text-[11px] font-medium text-gray-500">
                <Sparkles className="w-3 h-3 mr-1 text-amber-500" /> Samples:
              </span>
              {sampleImages.map((url, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setImageUrl(url)}
                  className="px-2 py-0.5 text-[10px] bg-gray-100 hover:bg-blue-50 hover:text-instagram-blue rounded border border-gray-200 transition-colors whitespace-nowrap"
                >
                  Photo {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Container */}
          <div className="border border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center bg-gray-50 overflow-hidden relative">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setError('Invalid image URL or failed to load image')}
              />
            ) : (
              <div className="text-center text-gray-400 p-4">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-xs">Image preview will appear here</p>
              </div>
            )}
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Caption
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption... (e.g. Sunset in Bali 🌅 #travel)"
              maxLength={500}
              className="w-full px-3 py-2 text-sm border border-instagram-border rounded-md focus:outline-none focus:border-instagram-blue focus:ring-1 focus:ring-instagram-blue resize-none"
            />
            <div className="text-right text-[11px] text-gray-400">
              {caption.length} / 500
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !imageUrl.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-instagram-blue hover:bg-instagram-hoverBlue disabled:bg-blue-300 rounded-md shadow-sm transition-colors flex items-center space-x-1"
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
