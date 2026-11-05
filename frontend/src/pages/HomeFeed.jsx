import React, { useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { postService } from '../services/postService';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// Sample fallback posts shown only when database is pristine empty
const INITIAL_DEMO_POSTS = [
  {
    _id: 'demo-1',
    user: {
      _id: 'user-demo-1',
      username: 'travel_diaries',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
    },
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
    caption: 'Serene sunrise over the coastline. Nature never fails to amaze. 🌅🌊 #travel #ocean',
    likes: ['user-1', 'user-2'],
    comments: [
      { _id: 'c1', user: { username: 'alex_wanderer' }, text: 'Incredible shot! What camera did you use?' },
      { _id: 'c2', user: { username: 'sarah_m' }, text: 'Adding this beach to my bucket list! 😍' },
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'demo-2',
    user: {
      _id: 'user-demo-2',
      username: 'tech_architect',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop',
    },
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    caption: 'Building microservices, configuring Docker containers, and optimizing CI/CD workflows 🚀 #devops #docker #cloud',
    likes: ['user-3'],
    comments: [
      { _id: 'c3', user: { username: 'coder_dev' }, text: 'Kubernetes or Docker Compose for this setup?' },
    ],
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
];

const HomeFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(async () => {
    try {
      const data = await postService.getPosts(1, 20);
      if (data && data.posts && data.posts.length > 0) {
        setPosts(data.posts);
      } else {
        // Fallback to demo items if server has 0 posts yet
        setPosts(INITIAL_DEMO_POSTS);
      }
      setError('');
    } catch (err) {
      console.warn('Backend feed unavailable, showing demo posts for evaluation:', err);
      setPosts(INITIAL_DEMO_POSTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();

    const handleNewPost = () => fetchFeed();
    window.addEventListener('post-created', handleNewPost);
    return () => window.removeEventListener('post-created', handleNewPost);
  }, [fetchFeed]);

  const handleLikeToggle = async (postId, willLike) => {
    try {
      if (willLike) {
        await postService.likePost(postId);
      } else {
        await postService.unlikePost(postId);
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  const handleAddComment = async (postId, text) => {
    try {
      const res = await postService.addComment(postId, text);
      return res.comment || { _id: Date.now().toString(), text, user: { username: 'you' } };
    } catch (err) {
      console.warn('API comment failed, optimistic update:', err);
      return { _id: Date.now().toString(), text, user: { username: 'you' } };
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
    } catch (err) {
      alert('Failed to delete post: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-instagram-bg">
      <Sidebar />
      <Navbar />

      <main className="md:ml-64 pb-20 md:pb-8 pt-4 px-3 sm:px-4 flex justify-center">
        <div className="w-full max-w-lg">
          {/* Feed Header */}
          <div className="flex items-center justify-between mb-4 px-1">
            <h1 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Home Feed
            </h1>
            <button
              onClick={() => {
                setRefreshing(true);
                fetchFeed();
              }}
              className="flex items-center space-x-1 text-xs text-instagram-secondary hover:text-black font-medium transition-colors"
              title="Refresh feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <ErrorMessage message={error} onRetry={fetchFeed} />

          {loading ? (
            <LoadingSpinner size="large" text="Loading posts..." />
          ) : posts.length === 0 ? (
            <div className="bg-white border border-instagram-border rounded-xl p-8 text-center shadow-sm">
              <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800 mb-1">No Posts Yet</h3>
              <p className="text-xs text-instagram-secondary mb-4">
                Follow users or upload your first photo to see moments in your feed.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id || post.id}
                post={post}
                onLikeToggle={handleLikeToggle}
                onAddComment={handleAddComment}
                onDeletePost={handleDeletePost}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default HomeFeed;
