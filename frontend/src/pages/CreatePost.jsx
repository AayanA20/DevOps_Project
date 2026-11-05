import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { postService } from '../services/postService';

const CreatePost = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sampleImages = [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setError('Please provide an image URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await postService.createPost({ imageUrl: imageUrl.trim(), caption: caption.trim() });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-instagram-bg">
      <Sidebar />
      <Navbar />

      <main className="md:ml-64 pb-20 md:pb-8 pt-8 px-4 flex justify-center">
        <div className="w-full max-w-lg bg-white border border-instagram-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-instagram-border">
            <h1 className="text-base font-semibold text-gray-900">Create New Post</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <ErrorMessage message={error} />

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Image URL
              </label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-3 py-2 text-sm border border-instagram-border rounded-md focus:outline-none focus:border-instagram-blue"
              />

              <div className="flex items-center gap-1.5 mt-2 text-xs text-instagram-secondary">
                <span className="flex items-center text-[11px] font-medium text-gray-500">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-500" /> Presets:
                </span>
                {sampleImages.map((url, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setImageUrl(url)}
                    className="px-2 py-0.5 text-[10px] bg-gray-100 hover:bg-blue-50 hover:text-instagram-blue rounded border border-gray-200"
                  >
                    Image {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-dashed border-gray-300 rounded-lg h-52 flex items-center justify-center bg-gray-50 overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setError('Invalid image URL')}
                />
              ) : (
                <div className="text-center text-gray-400 p-4">
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">Image preview</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Caption
              </label>
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your caption here..."
                maxLength={500}
                className="w-full px-3 py-2 text-sm border border-instagram-border rounded-md focus:outline-none focus:border-instagram-blue resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !imageUrl.trim()}
              className="w-full py-2.5 bg-instagram-blue hover:bg-instagram-hoverBlue disabled:bg-blue-300 text-white font-semibold text-sm rounded-md shadow-sm transition-colors flex items-center justify-center"
            >
              {loading ? <LoadingSpinner size="small" text="" /> : 'Share Post'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreatePost;

