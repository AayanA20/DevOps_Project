import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Heart, MessageCircle, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProfileHeader from '../components/ProfileHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import { useAuth } from '../hooks/useAuth';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch user profile
      const userRes = await userService.getUserProfile(id || currentUser?._id || currentUser?.id);
      setProfileUser(userRes.user || userRes);

      // Check if current user is following this profile
      const currentUserId = currentUser?._id || currentUser?.id;
      const followers = userRes.user?.followers || userRes.followers || [];
      const following = followers.some((f) => {
        const fId = typeof f === 'string' ? f : f._id || f.id;
        return fId && currentUserId && fId.toString() === currentUserId.toString();
      });
      setIsFollowing(following);

      // 2. Fetch user's posts
      if (userRes.posts) {
        setUserPosts(userRes.posts);
      } else {
        const postsRes = await postService.getPosts(1, 50);
        const filtered = (postsRes.posts || []).filter((p) => {
          const pUserId = p.user?._id || p.user?.id || p.user;
          return pUserId && pUserId.toString() === (id || currentUserId)?.toString();
        });
        setUserPosts(filtered);
      }
    } catch (err) {
      console.warn('Could not fetch remote profile, using local session state:', err);
      // Fallback if looking at own profile or demo
      if (currentUser && (!id || id === currentUser._id || id === currentUser.id)) {
        setProfileUser(currentUser);
        setUserPosts([]);
      } else {
        setError(err.response?.data?.message || 'Failed to load user profile');
      }
    } finally {
      setLoading(false);
    }
  }, [id, currentUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFollowToggle = async () => {
    const profileId = profileUser?._id || profileUser?.id;
    if (!profileId) return;

    try {
      if (isFollowing) {
        await userService.unfollowUser(profileId);
        setIsFollowing(false);
        setProfileUser((prev) => ({
          ...prev,
          followers: (prev.followers || []).filter(
            (f) => (f._id || f) !== (currentUser?._id || currentUser?.id)
          ),
        }));
      } else {
        await userService.followUser(profileId);
        setIsFollowing(true);
        setProfileUser((prev) => ({
          ...prev,
          followers: [...(prev.followers || []), currentUser?._id || currentUser?.id],
        }));
      }
    } catch (err) {
      console.error('Failed to toggle follow status', err);
    }
  };

  return (
    <div className="min-h-screen bg-instagram-bg">
      <Sidebar />
      <Navbar />

      <main className="md:ml-64 pb-20 md:pb-8 pt-6 px-4">
        <div className="max-w-4xl mx-auto">
          <ErrorMessage message={error} onRetry={fetchProfile} />

          {loading ? (
            <LoadingSpinner size="large" text="Loading profile..." />
          ) : profileUser ? (
            <>
              <ProfileHeader
                profileUser={profileUser}
                postsCount={userPosts.length}
                isFollowing={isFollowing}
                onFollowToggle={handleFollowToggle}
              />

              {/* Grid Tab Header */}
              <div className="border-t border-instagram-border mt-8 pt-3 flex justify-center">
                <div className="flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-gray-900 border-t-2 border-black -mt-3.5 pt-3">
                  <Grid className="w-3.5 h-3.5" />
                  <span>Posts</span>
                </div>
              </div>

              {/* 3-Column Posts Grid */}
              {userPosts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-sm font-medium">No posts shared yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 md:gap-4 mt-4">
                  {userPosts.map((post) => (
                    <div
                      key={post._id || post.id}
                      className="relative aspect-square bg-gray-100 overflow-hidden group cursor-pointer rounded-sm"
                    >
                      <img
                        src={post.imageUrl}
                        alt={post.caption || 'User post'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Hover Overlay with Likes & Comments */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6 text-white font-semibold text-sm">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-5 h-5 fill-white" />
                          <span>{(post.likes && post.likes.length) || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-5 h-5 fill-white" />
                          <span>{(post.comments && post.comments.length) || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">User not found</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfile;

