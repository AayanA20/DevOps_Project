import React, { useState } from 'react';
import {
  UserPlus,
  UserCheck,
  Calendar,
  CheckCircle2,
  Lock,
  Globe,
  Settings,
  Clock,
  Bell,
  X,
  GraduationCap,
  Terminal,
  Palmtree,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const HIGHLIGHTS_DATA = [
  {
    id: 'h1',
    label: 'Campus',
    img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-indigo-600',
    caption: 'University library and campus moments 🎓📚',
  },
  {
    id: 'h2',
    label: 'DevOps',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    icon: Terminal,
    gradient: 'from-emerald-500 to-teal-700',
    caption: 'Docker containers, CI/CD pipelines & microservices 🚀🐳',
  },
  {
    id: 'h3',
    label: 'Travel',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    icon: Palmtree,
    gradient: 'from-amber-500 to-rose-600',
    caption: 'Weekend getaway to the coast 🌴🌊',
  },
  {
    id: 'h4',
    label: 'Projects',
    img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
    icon: Laptop,
    gradient: 'from-purple-500 to-pink-600',
    caption: 'Building Mini Instagram architecture & System Design 💻✨',
  },
];

const ProfileHeader = ({
  profileUser,
  postsCount = 0,
  isFollowing,
  hasRequested,
  onFollowToggle,
  onEditProfile,
  onViewRequests,
  onOpenFollowList,
}) => {
  const { user: currentUser } = useAuth();
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [imgErrors, setImgErrors] = useState({});

  const currentUserId = currentUser?._id || currentUser?.id;
  const profileId = profileUser?._id || profileUser?.id;
  const isMe = currentUserId && profileId && currentUserId.toString() === profileId.toString();

  const followersCount = (profileUser?.followers && profileUser.followers.length) || 0;
  const followingCount = (profileUser?.following && profileUser.following.length) || 0;
  const followRequestsCount = (profileUser?.followRequests && profileUser.followRequests.length) || 0;
  const isPrivate = Boolean(profileUser?.isPrivate);
  const canViewNetwork = !isPrivate || isMe || isFollowing;

  const joinDate = profileUser?.createdAt
    ? new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  const handleImageError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <>
      <header className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 mb-6 max-w-3xl mx-auto shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          {/* Avatar with Signature Story Ring */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full story-ring p-[3px] shadow-md group cursor-pointer">
              <img
                src={
                  profileUser?.profilePicture ||
                  `https://ui-avatars.com/api/?name=${profileUser?.username || 'User'}&size=150&background=random`
                }
                alt={profileUser?.username || 'User profile'}
                className="w-full h-full rounded-full object-cover border-4 border-white"
              />
            </div>
          </div>

          {/* Info & Stats */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  {profileUser?.username || 'username'}
                </h1>
                <CheckCircle2 className="w-4 h-4 text-instagram-blue fill-blue-50" />
              </div>

              {/* Privacy Badge */}
              <span
                className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                  isPrivate
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                <span>{isPrivate ? 'Private' : 'Public'}</span>
              </span>

              {/* Actions: Owner Edit / Follower Actions */}
              {isMe ? (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onEditProfile}
                    className="flex items-center space-x-1.5 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg border border-gray-300 transition-colors shadow-sm"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>

                  {followRequestsCount > 0 && (
                    <button
                      type="button"
                      onClick={onViewRequests}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors animate-pulse"
                    >
                      <Bell className="w-3.5 h-3.5 text-rose-600" />
                      <span>{followRequestsCount} Request{followRequestsCount > 1 ? 's' : ''}</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onFollowToggle}
                  className={`flex items-center space-x-1 px-5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all duration-150 ${
                    isFollowing
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                      : hasRequested
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-instagram-blue hover:bg-instagram-hoverBlue text-white active:scale-95'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 mr-1" />
                      <span>Following</span>
                    </>
                  ) : hasRequested ? (
                    <>
                      <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                      <span>Requested</span>
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

            {/* Stats Bar */}
            <div className="flex justify-center sm:justify-start space-x-7 mb-4 text-sm text-gray-800">
              <div>
                <span className="font-bold text-black">{postsCount}</span>{' '}
                <span className="text-gray-600">posts</span>
              </div>
              <button
                type="button"
                onClick={() => canViewNetwork && onOpenFollowList && onOpenFollowList('followers')}
                disabled={!canViewNetwork}
                className={`transition-opacity text-left focus:outline-none ${
                  canViewNetwork
                    ? 'cursor-pointer hover:opacity-75 group'
                    : 'cursor-not-allowed opacity-60'
                }`}
                title={canViewNetwork ? 'View followers' : 'Followers hidden (private account)'}
              >
                <span className="font-bold text-black group-hover:text-instagram-blue transition-colors">
                  {followersCount}
                </span>{' '}
                <span className="text-gray-600 group-hover:text-black transition-colors">followers</span>
              </button>
              <button
                type="button"
                onClick={() => canViewNetwork && onOpenFollowList && onOpenFollowList('following')}
                disabled={!canViewNetwork}
                className={`transition-opacity text-left focus:outline-none ${
                  canViewNetwork
                    ? 'cursor-pointer hover:opacity-75 group'
                    : 'cursor-not-allowed opacity-60'
                }`}
                title={canViewNetwork ? 'View following' : 'Following hidden (private account)'}
              >
                <span className="font-bold text-black group-hover:text-instagram-blue transition-colors">
                  {followingCount}
                </span>{' '}
                <span className="text-gray-600 group-hover:text-black transition-colors">following</span>
              </button>
            </div>

            {/* Bio & Details */}
            <div>
              <p className="font-semibold text-xs text-gray-900">{profileUser?.email}</p>
              <p className="text-xs text-gray-700 whitespace-pre-line mt-1 leading-relaxed">
                {profileUser?.bio || 'Mini Instagram member • Sharing memories & snapshots 📸'}
              </p>
              {joinDate && (
                <div className="flex items-center justify-center sm:justify-start space-x-1 text-[11px] text-gray-400 mt-2">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {joinDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Story Highlights Bar (Click to View Highlights) */}
        <div className="border-t border-gray-100 mt-6 pt-5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
            Story Highlights
          </p>
          <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar py-1">
            {HIGHLIGHTS_DATA.map((item) => {
              const hasError = !!imgErrors[item.id];
              const IconComponent = item.icon;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveHighlight(item)}
                  className="flex flex-col items-center flex-shrink-0 group focus:outline-none cursor-pointer"
                  title={`View ${item.label} Highlight`}
                >
                  <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-gray-200 to-gray-300 group-hover:from-amber-400 group-hover:via-rose-500 group-hover:to-purple-600 transition-all duration-200 group-hover:scale-105 shadow-sm">
                    <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100 flex items-center justify-center">
                      {!hasError ? (
                        <img
                          src={item.img}
                          alt={item.label}
                          onError={() => handleImageError(item.id)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-tr ${item.gradient} flex items-center justify-center text-white`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 mt-1.5 truncate max-w-[64px] group-hover:text-black transition-colors">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Interactive Story Highlight Viewer Modal */}
      {activeHighlight && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveHighlight(null)}
        >
          <div
            className="relative max-w-sm w-full bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Progress Bar */}
            <div className="absolute top-0 left-0 right-0 p-3 z-20">
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-full animate-[shrink_5s_linear_forwards]" />
              </div>
            </div>

            {/* Top Bar Header */}
            <div className="absolute top-4 left-0 right-0 px-4 py-2 z-20 flex items-center justify-between text-white bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-white">
                  <img
                    src={activeHighlight.img}
                    alt={activeHighlight.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold leading-none">{activeHighlight.label}</p>
                  <p className="text-[10px] text-white/70 leading-none mt-0.5">
                    {profileUser?.username} • Highlight
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveHighlight(null)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close Highlight"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Content */}
            <div className="relative h-[520px] flex items-center justify-center bg-black">
              <img
                src={activeHighlight.img}
                alt={activeHighlight.label}
                className="w-full h-full object-cover"
              />

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
                <p className="text-sm font-medium leading-relaxed">
                  {activeHighlight.caption}
                </p>
                <p className="text-[11px] text-white/60 mt-1">
                  Pinned to profile highlights
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileHeader;
