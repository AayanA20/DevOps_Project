import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, UserCheck, Compass } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';

const Explore = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getSuggestedUsers();
        const list = data.users || [];
        setUsers(list);

        // Map initial following states
        const currentUserId = currentUser?._id || currentUser?.id;
        const initialMap = {};
        list.forEach((u) => {
          const isF = (u.followers || []).some(
            (f) => (f._id || f).toString() === currentUserId?.toString()
          );
          initialMap[u._id || u.id] = isF;
        });
        setFollowingMap(initialMap);
      } catch (err) {
        console.warn('Suggested users unavailable, rendering sample recommendations:', err);
        // Fallback sample users
        setUsers([
          {
            _id: 'sample-u1',
            username: 'travel_diaries',
            bio: 'Exploring the globe one coffee at a time ☕🌍',
            profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
            followers: [],
          },
          {
            _id: 'sample-u2',
            username: 'tech_architect',
            bio: 'Distributed systems & DevOps engineer 💻🚀',
            profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop',
            followers: [],
          },
          {
            _id: 'sample-u3',
            username: 'nature_lens',
            bio: 'Capturing wildlife & landscape wonders 🌿🏔️',
            profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop',
            followers: [],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleFollowToggle = async (targetId) => {
    const currentlyFollowing = !!followingMap[targetId];
    try {
      if (currentlyFollowing) {
        await userService.unfollowUser(targetId);
      } else {
        await userService.followUser(targetId);
      }
      setFollowingMap((prev) => ({ ...prev, [targetId]: !currentlyFollowing }));
    } catch (err) {
      console.error('Follow toggle error:', err);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-instagram-bg">
      <Sidebar />
      <Navbar />

      <main className="md:ml-64 pb-20 md:pb-8 pt-6 px-4">
        <div className="max-w-xl mx-auto">
          {/* Header & Search */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Compass className="w-6 h-6 text-instagram-blue" />
              <h1 className="text-xl font-bold text-gray-900">Explore & Discover</h1>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search community users by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-instagram-border rounded-lg text-sm focus:outline-none focus:border-instagram-blue shadow-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* User List */}
          {loading ? (
            <LoadingSpinner size="medium" text="Finding creators..." />
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white border border-instagram-border rounded-xl p-8 text-center text-gray-500 text-sm">
              No users found matching "{searchQuery}".
            </div>
          ) : (
            <div className="bg-white border border-instagram-border rounded-xl divide-y divide-gray-100 shadow-sm overflow-hidden">
              {filteredUsers.map((itemUser) => {
                const uId = itemUser._id || itemUser.id;
                const isFollowing = !!followingMap[uId];
                const isMe =
                  (currentUser?._id || currentUser?.id)?.toString() === uId?.toString();

                return (
                  <div key={uId} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <Link to={`/profile/${uId}`} className="flex items-center space-x-3 truncate flex-1 mr-4">
                      <img
                        src={
                          itemUser.profilePicture ||
                          `https://ui-avatars.com/api/?name=${itemUser.username}&background=random`
                        }
                        alt={itemUser.username}
                        className="w-11 h-11 rounded-full object-cover border border-instagram-border flex-shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-sm font-semibold text-gray-900 hover:underline truncate">
                          {itemUser.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {itemUser.bio || 'Mini Instagram member'}
                        </p>
                      </div>
                    </Link>

                    {!isMe && (
                      <button
                        onClick={() => handleFollowToggle(uId)}
                        className={`text-xs font-semibold px-4 py-1.5 rounded transition-colors flex items-center space-x-1 ${
                          isFollowing
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                            : 'bg-instagram-blue hover:bg-instagram-hoverBlue text-white'
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
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Explore;
