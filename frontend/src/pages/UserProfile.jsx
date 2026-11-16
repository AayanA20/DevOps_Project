import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Heart, MessageCircle, Lock, ShieldCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProfileHeader from '../components/ProfileHeader';
import EditProfileModal from '../components/EditProfileModal';
import FollowRequestsModal from '../components/FollowRequestsModal';
import FollowersListModal from '../components/FollowersListModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import { useAuth } from '../hooks/useAuth';
import { subscribeToSync } from '../utils/syncManager';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [canViewPosts, setCanViewPosts] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [isFollowListOpen, setIsFollowListOpen] = useState(false);
  const [followListTab, setFollowListTab] = useState('followers');

  const fetchProfile = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const targetId = id || currentUser?._id || currentUser?.id;
      const userRes = await userService.getUserProfile(targetId);
      const userObj = userRes.user || userRes;
      setProfileUser(userObj);

      const currentUserId = currentUser?._id || currentUser?.id;
      const isMe = currentUserId && userObj._id.toString() === currentUserId.toString();

      const followingState =
        typeof userRes.isFollowing !== 'undefined'
          ? userRes.isFollowing
          : (userObj.followers || []).some(
              (f) => (f._id || f).toString() === currentUserId?.toString()
            );

      const requestedState =
        typeof userRes.hasRequested !== 'undefined'
          ? userRes.hasRequested
          : (userObj.followRequests || []).some(
              (r) => (r._id || r).toString() === currentUserId?.toString()
            );

      const privateState = Boolean(userObj.isPrivate);
      const canView = typeof userRes.canViewPosts !== 'undefined'
        ? userRes.canViewPosts
        : (!privateState || isMe || followingState);

      setIsFollowing(followingState);
      setHasRequested(requestedState);
      setIsPrivate(privateState);
      setCanViewPosts(canView);

      if (canView) {
        if (userRes.posts) {
          setUserPosts(userRes.posts);
        } else {
          const postsRes = await postService.getPosts(1, 50);
          const filtered = (postsRes.posts || []).filter((p) => {
            const pUserId = p.user?._id || p.user?.id || p.user;
            return pUserId && pUserId.toString() === targetId?.toString();
          });
          setUserPosts(filtered);
        }
      } else {
        setUserPosts([]);
      }
    } catch (err) {
      console.warn('Could not fetch remote profile, using local session state:', err);
      if (currentUser && (!id || id === currentUser._id || id === currentUser.id)) {
        setProfileUser(currentUser);
        setIsPrivate(Boolean(currentUser.isPrivate));
        setUserPosts([]);
      } else {
        setError(err.response?.data?.message || 'Failed to load user profile');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [id, currentUser]);

  useEffect(() => {
    // Initial fetch
    fetchProfile();

    // 1. Real-time background sync polling every 3 seconds (silent, zero flicker)
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchProfile(true);
      }
    }, 3000);

    // 2. Immediately refresh when tab gains focus or becomes visible
    const handleFocus = () => fetchProfile(true);
    const handleVisibility = () => {
      if (!document.hidden) fetchProfile(true);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // 3. Cross-tab and local event subscriptions
    const unsubscribeSync = subscribeToSync(() => {
      fetchProfile(true);
    });

    const handleLocalSync = () => fetchProfile(true);
    window.addEventListener('follow-requests-updated', handleLocalSync);
    window.addEventListener('follow-status-changed', handleLocalSync);
    window.addEventListener('profile-updated', handleLocalSync);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      unsubscribeSync();
      window.removeEventListener('follow-requests-updated', handleLocalSync);
      window.removeEventListener('follow-status-changed', handleLocalSync);
      window.removeEventListener('profile-updated', handleLocalSync);
    };
  }, [fetchProfile]);

  const handleFollowToggle = async () => {
    const profileId = profileUser?._id || profileUser?.id;
    if (!profileId) return;

    try {
      if (isFollowing || hasRequested) {
        // Unfollow or cancel request
        await userService.unfollowUser(profileId);
        setIsFollowing(false);
        setHasRequested(false);
        setProfileUser((prev) => ({
          ...prev,
          followers: (prev.followers || []).filter(
            (f) => (f._id || f).toString() !== (currentUser?._id || currentUser?.id)?.toString()
          ),
          followRequests: (prev.followRequests || []).filter(
            (r) => (r._id || r).toString() !== (currentUser?._id || currentUser?.id)?.toString()
          ),
        }));
        if (isPrivate) {
          setCanViewPosts(false);
          setUserPosts([]);
        }
      } else {
        // Follow or request follow
        const res = await userService.followUser(profileId);
        if (res.status === 'requested') {
          setHasRequested(true);
        } else {
          setIsFollowing(true);
          setCanViewPosts(true);
          setProfileUser((prev) => ({
            ...prev,
            followers: [...(prev.followers || []), currentUser?._id || currentUser?.id],
          }));
          // Refresh to fetch now-accessible posts
          fetchProfile();
        }
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
                hasRequested={hasRequested}
                onFollowToggle={handleFollowToggle}
                onEditProfile={() => setIsEditOpen(true)}
                onViewRequests={() => setIsRequestsOpen(true)}
                onOpenFollowList={(tab) => {
                  setFollowListTab(tab);
                  setIsFollowListOpen(true);
                }}
              />

              {/* Private Account Access Gate */}
              {!canViewPosts ? (
                <div className="bg-white border border-gray-200/90 rounded-2xl p-12 text-center max-w-3xl mx-auto shadow-sm mt-4">
                  <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4 border border-purple-100">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    This Account is Private
                  </h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                    Follow this account to see their photos and updates.
                  </p>
                  <button
                    onClick={handleFollowToggle}
                    className={`px-6 py-2 text-xs font-semibold rounded-xl shadow-sm transition-all ${
                      hasRequested
                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                        : 'bg-instagram-blue hover:bg-instagram-hoverBlue text-white'
                    }`}
                  >
                    {hasRequested ? 'Follow Request Pending' : 'Follow to See Posts'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Grid Tab Header */}
                  <div className="border-t border-gray-200 mt-8 pt-3 flex justify-center">
                    <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-gray-900 border-t-2 border-black -mt-3.5 pt-3">
                      <Grid className="w-3.5 h-3.5" />
                      <span>Posts</span>
                    </div>
                  </div>

                  {/* 3-Column Posts Grid */}
                  {userPosts.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-gray-400 text-xs font-semibold tracking-wider uppercase">
                        No posts shared yet
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 md:gap-4 mt-4">
                      {userPosts.map((post) => (
                        <div
                          key={post._id || post.id}
                          className="relative aspect-square bg-gray-100 overflow-hidden group cursor-pointer rounded-sm md:rounded-xl shadow-sm"
                        >
                          <img
                            src={post.imageUrl}
                            alt={post.caption || 'User post'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
              )}

              {/* Edit Profile Modal */}
              <EditProfileModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onProfileUpdated={(updated) => {
                  setProfileUser((prev) => ({ ...prev, ...updated }));
                  setIsPrivate(Boolean(updated.isPrivate));
                }}
              />

              {/* Follow Requests Modal */}
              <FollowRequestsModal
                isOpen={isRequestsOpen}
                onClose={() => setIsRequestsOpen(false)}
                requests={profileUser?.followRequests || []}
                onActionCompleted={(updatedUser) => {
                  if (updatedUser) {
                    setProfileUser((prev) => ({ ...prev, ...updatedUser }));
                  }
                  fetchProfile(true);
                }}
              />

              {/* Followers / Following Modal */}
              <FollowersListModal
                isOpen={isFollowListOpen}
                onClose={() => setIsFollowListOpen(false)}
                initialTab={followListTab}
                userId={profileUser?._id || profileUser?.id}
                username={profileUser?.username}
                initialFollowers={profileUser?.followers || []}
                initialFollowing={profileUser?.following || []}
                onFollowChange={() => fetchProfile(true)}
              />
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
