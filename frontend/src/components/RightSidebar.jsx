import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SUGGESTED_USERS = [
  {
    id: 'sug-1',
    username: 'nature_lens',
    subtext: 'Followed by alex_wanderer + 2 more',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop',
  },
  {
    id: 'sug-2',
    username: 'urban_shots',
    subtext: 'Suggested for you',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop',
  },
  {
    id: 'sug-3',
    username: 'foodie_vibes',
    subtext: 'New to Instagram',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop',
  },
  {
    id: 'sug-4',
    username: 'campus_life',
    subtext: 'Followed by travel_diaries',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop',
  },
];

const RightSidebar = () => {
  const { user } = useAuth();
  const [followingMap, setFollowingMap] = useState({});

  const toggleFollow = (id) => {
    setFollowingMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentUserId = user?._id || user?.id || '';
  const userAvatar =
    user?.profilePicture ||
    `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`;

  return (
    <aside className="hidden lg:block w-80 pl-8 pt-4 flex-shrink-0">
      {/* Current User Card */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to={`/profile/${currentUserId}`}
          className="flex items-center space-x-3 group min-w-0"
        >
          <div className="w-11 h-11 rounded-full p-[1.5px] story-ring flex-shrink-0">
            <img
              src={userAvatar}
              alt={user?.username}
              className="w-full h-full rounded-full object-cover border-2 border-white"
            />
          </div>
          <div className="truncate">
            <p className="text-sm font-semibold text-gray-900 group-hover:underline truncate">
              {user?.username || 'you'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'Logged in'}</p>
          </div>
        </Link>
        <Link
          to={`/profile/${currentUserId}`}
          className="text-xs font-semibold text-instagram-blue hover:text-instagram-hoverBlue flex-shrink-0"
        >
          View
        </Link>
      </div>

      {/* Suggestions Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500">Suggested for you</span>
        <Link
          to="/explore"
          className="text-xs font-semibold text-gray-900 hover:text-gray-500 transition-colors"
        >
          See All
        </Link>
      </div>

      {/* Suggested Users List */}
      <div className="space-y-3 mb-6">
        {SUGGESTED_USERS.map((sug) => {
          const isFollowing = !!followingMap[sug.id];
          return (
            <div key={sug.id} className="flex items-center justify-between py-1">
              <Link to="/explore" className="flex items-center space-x-3 min-w-0 group">
                <img
                  src={sug.avatar}
                  alt={sug.username}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-100"
                />
                <div className="truncate">
                  <p className="text-xs font-semibold text-gray-900 group-hover:underline truncate">
                    {sug.username}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">{sug.subtext}</p>
                </div>
              </Link>
              <button
                onClick={() => toggleFollow(sug.id)}
                className={`text-xs font-semibold px-2 py-1 rounded transition-colors flex-shrink-0 ${
                  isFollowing
                    ? 'text-gray-400 hover:text-black'
                    : 'text-instagram-blue hover:text-instagram-hoverBlue'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Meta */}
      <div className="text-[11px] text-gray-400 space-y-2 border-t border-gray-100 pt-4">
        <p className="leading-relaxed">
          About • Help • API • Jobs • Privacy • Terms • Locations
        </p>
        <p className="font-medium text-gray-400">
          © 2026 MINI INSTAGRAM • UNIVERSITY DEVOPS ASSIGNMENT
        </p>
      </div>
    </aside>
  );
};

export default RightSidebar;
