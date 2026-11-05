import React from 'react';
import { UserPlus, UserCheck, Calendar } from 'lucide-react';
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
    <header className="bg-white border border-instagram-border rounded-lg p-6 mb-8 max-w-2xl mx-auto shadow-sm">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="relative">
          <img
            src={
              profileUser?.profilePicture ||
              `https://ui-avatars.com/api/?name=${profileUser?.username || 'User'}&size=150&background=random`
            }
            alt={profileUser?.username || 'User profile'}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-instagram-border p-0.5"
          />
        </div>

        {/* Info & Stats */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <h1 className="text-xl sm:text-2xl font-light text-gray-900 tracking-tight">
              {profileUser?.username || 'username'}
            </h1>

            {isMe ? (
              <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 font-semibold rounded border border-gray-300">
                Your Profile
              </span>
            ) : (
              <button
                onClick={onFollowToggle}
                className={`flex items-center space-x-1 px-4 py-1.5 rounded text-sm font-semibold transition-colors ${
                  isFollowing
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                    : 'bg-instagram-blue hover:bg-instagram-hoverBlue text-white'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-1" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex justify-center sm:justify-start space-x-8 mb-4 text-sm text-gray-800">
            <div>
              <span className="font-bold">{postsCount}</span> posts
            </div>
            <div>
              <span className="font-bold">{followersCount}</span> followers
            </div>
            <div>
              <span className="font-bold">{followingCount}</span> following
            </div>
          </div>

          {/* Bio & Details */}
          <div>
            <p className="font-semibold text-sm text-gray-900">{profileUser?.email}</p>
            <p className="text-sm text-gray-700 whitespace-pre-line mt-1">
              {profileUser?.bio || 'No bio yet.'}
            </p>
            {joinDate && (
              <div className="flex items-center justify-center sm:justify-start space-x-1 text-xs text-instagram-secondary mt-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {joinDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;
