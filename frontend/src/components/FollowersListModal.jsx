import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Users, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';

const FollowersListModal = ({
  isOpen,
  onClose,
  initialTab = 'followers', // 'followers' | 'following'
  userId,
  username = 'User',
  initialFollowers = [],
  initialFollowing = [],
  onFollowChange,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?._id || currentUser?.id;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState(initialFollowers);
  const [following, setFollowing] = useState(initialFollowing);
  const [actionLoading, setActionLoading] = useState({});

  // Sync tab when prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Sync initial lists
  useEffect(() => {
    if (Array.isArray(initialFollowers)) {
      setFollowers(initialFollowers);
    }
  }, [initialFollowers]);

  useEffect(() => {
    if (Array.isArray(initialFollowing)) {
      setFollowing(initialFollowing);
    }
  }, [initialFollowing]);

  // Fetch updated list when modal opens or tab changes
  useEffect(() => {
    if (!isOpen || !userId) return;

    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'followers') {
          const res = await userService.getFollowers(userId);
          if (isMounted && res?.followers) {
            setFollowers(res.followers);
          }
        } else {
          const res = await userService.getFollowing(userId);
          if (isMounted && res?.following) {
            setFollowing(res.following);
          }
        }
      } catch (err) {
        console.warn(`Could not refresh ${activeTab} from server, using local data:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [isOpen, userId, activeTab]);

  // Filter list by search query
  const displayedList = useMemo(() => {
    const list = activeTab === 'followers' ? followers : following;
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((u) => {
      const uName = (u?.username || '').toLowerCase();
      const uBio = (u?.bio || '').toLowerCase();
      return uName.includes(q) || uBio.includes(q);
    });
  }, [activeTab, followers, following, searchQuery]);

  if (!isOpen) return null;

  // Toggle follow/unfollow inline
  const handleToggleFollow = async (targetUser) => {
    const targetId = targetUser?._id || targetUser?.id;
    if (!targetId || targetId.toString() === currentUserId?.toString()) return;

    setActionLoading((prev) => ({ ...prev, [targetId]: true }));
    try {
      // Check if current user is following targetUser
      const isCurrentlyFollowing = (targetUser.followers || []).some(
        (f) => (f._id || f).toString() === currentUserId?.toString()
      );

      if (isCurrentlyFollowing) {
        await userService.unfollowUser(targetId);
        // Optimistically update targetUser's followers
        const updateItem = (item) => {
          if ((item._id || item.id).toString() === targetId.toString()) {
            return {
              ...item,
              followers: (item.followers || []).filter(
                (f) => (f._id || f).toString() !== currentUserId?.toString()
              ),
            };
          }
          return item;
        };
        setFollowers((prev) => prev.map(updateItem));
        setFollowing((prev) => prev.map(updateItem));
      } else {
        await userService.followUser(targetId);
        const updateItem = (item) => {
          if ((item._id || item.id).toString() === targetId.toString()) {
            return {
              ...item,
              followers: [...(item.followers || []), currentUserId],
            };
          }
          return item;
        };
        setFollowers((prev) => prev.map(updateItem));
        setFollowing((prev) => prev.map(updateItem));
      }

      if (onFollowChange) onFollowChange();
    } catch (err) {
      console.error('Follow toggle error:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  const handleUserClick = (targetUser) => {
    const targetId = targetUser?._id || targetUser?.id;
    if (targetId) {
      onClose();
      navigate(`/profile/${targetId}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 pt-3 pb-0 bg-white sticky top-0 z-10">
          <div className="flex space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab('followers')}
              className={`pb-3 text-sm font-semibold transition-all relative ${
                activeTab === 'followers'
                  ? 'text-black border-b-2 border-black font-bold'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              Followers ({followers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('following')}
              className={`pb-3 text-sm font-semibold transition-all relative ${
                activeTab === 'following'
                  ? 'text-black border-b-2 border-black font-bold'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              Following ({following.length})
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors mb-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/60">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 p-2 min-h-[220px]">
          {loading && displayedList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-instagram-blue mb-2" />
              <p className="text-xs">Loading {activeTab}...</p>
            </div>
          ) : displayedList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
              {activeTab === 'followers' ? (
                <Users className="w-10 h-10 stroke-[1.5] text-gray-300 mb-2" />
              ) : (
                <UserPlus className="w-10 h-10 stroke-[1.5] text-gray-300 mb-2" />
              )}
              <p className="text-xs font-semibold text-gray-600">
                {searchQuery
                  ? `No ${activeTab} match "${searchQuery}"`
                  : activeTab === 'followers'
                  ? `${username} has no followers yet`
                  : `${username} isn't following anyone yet`}
              </p>
              {searchQuery && (
                <p className="text-[11px] text-gray-400 mt-1">Try checking for typos or searching another name.</p>
              )}
            </div>
          ) : (
            displayedList.map((u) => {
              const uId = u?._id || u?.id;
              const isSelf = currentUserId && uId && currentUserId.toString() === uId.toString();
              const isFollowingUser =
                currentUserId &&
                (u?.followers || []).some(
                  (f) => (f._id || f).toString() === currentUserId.toString()
                );
              const isActionLoading = actionLoading[uId];

              return (
                <div
                  key={uId}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50/80 transition-colors"
                >
                  {/* User info click opens profile */}
                  <div
                    onClick={() => handleUserClick(u)}
                    className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0 pr-3"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                      <img
                        src={
                          u?.profilePicture ||
                          `https://ui-avatars.com/api/?name=${u?.username || 'User'}&background=random`
                        }
                        alt={u?.username || 'User'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate hover:underline">
                        {u?.username || 'User'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {u?.bio || `@${u?.username || 'user'}`}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {isSelf ? (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[11px] font-semibold rounded-lg">
                        You
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleToggleFollow(u)}
                        className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                          isFollowingUser
                            ? 'bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-gray-800 border border-gray-200'
                            : 'bg-instagram-blue hover:bg-instagram-hoverBlue text-white active:scale-95'
                        }`}
                      >
                        {isActionLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isFollowingUser ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 mr-1" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5 mr-1" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersListModal;
