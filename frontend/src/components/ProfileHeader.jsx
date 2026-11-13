import React from 'react';
import { UserPlus, UserCheck, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ProfileHeader = ({ profileUser, postsCount = 0, isFollowing, onFollowToggle }) => {
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?._id || currentUser?.id;
  const profileId = profileUser?._id || profileUser?.id;
  const isMe = currentUserId && profileId && currentUserId.toString() === profileId.toString();

  const followersCount = (profileUser?.followers && profileUser.followers.length) || 0;
  const followingCount = (profileUser?.following && profileUser.following.length) || 0;

  const joinDate = profileUser?.createdAt
    ? new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  return (
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

            {isMe ? (
              <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-800 font-semibold rounded-lg border border-gray-200">
                Your Account
              </span>
            ) : (
              <button
                onClick={onFollowToggle}
                className={`flex items-center space-x-1 px-5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all duration-150 ${
                  isFollowing
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                    : 'bg-instagram-blue hover:bg-instagram-hoverBlue text-white active:scale-95'
                }`}
              >
                {isFollowing ? (
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

          {/* Stats Bar */}
          <div className="flex justify-center sm:justify-start space-x-7 mb-4 text-sm text-gray-800">
            <div>
              <span className="font-bold text-black">{postsCount}</span> <span className="text-gray-600">posts</span>
            </div>
            <div>
              <span className="font-bold text-black">{followersCount}</span> <span className="text-gray-600">followers</span>
            </div>
            <div>
              <span className="font-bold text-black">{followingCount}</span> <span className="text-gray-600">following</span>
            </div>
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

      {/* Story Highlights Bar */}
      <div className="border-t border-gray-100 mt-6 pt-5 flex items-center space-x-5 overflow-x-auto no-scrollbar">
        {[
          { label: 'Campus', img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&auto=format&fit=crop' },
          { label: 'DevOps', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop' },
          { label: 'Travel', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&auto=format&fit=crop' },
          { label: 'Projects', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=100&auto=format&fit=crop' },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
            <div className="w-14 h-14 rounded-full p-[2px] bg-gray-200 group-hover:bg-gradient-to-tr group-hover:from-amber-400 group-hover:via-rose-500 group-hover:to-purple-600 transition-all duration-200">
              <img
                src={item.img}
                alt={item.label}
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
            </div>
            <span className="text-[10px] font-medium text-gray-600 mt-1 truncate max-w-[56px] group-hover:text-black">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </header>
  );
};

export default ProfileHeader;
