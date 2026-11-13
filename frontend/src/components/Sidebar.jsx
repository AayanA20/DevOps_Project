import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, PlusSquare, User, LogOut, Camera, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import CreatePostModal from './CreatePostModal';
import { postService } from '../services/postService';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreatePost = async (postData) => {
    await postService.createPost(postData);
    window.dispatchEvent(new Event('post-created'));
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center space-x-4 px-3.5 py-3 rounded-xl transition-all duration-200 group ${
      isActive
        ? 'font-bold text-gray-900 bg-gray-100/90 shadow-sm'
        : 'text-gray-700 hover:bg-gray-50/90 hover:text-black font-medium'
    }`;

  const currentUserId = user?._id || user?.id || '';
  const userAvatar =
    user?.profilePicture ||
    `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`;

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-gray-200/80 bg-white px-5 py-7 justify-between z-30 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
        <div className="space-y-7">
          {/* Logo Header */}
          <NavLink to="/" className="flex items-center space-x-3 px-2 group">
            <div className="w-10 h-10 rounded-2xl story-ring p-[2px] shadow-[0_4px_14px_rgba(225,48,108,0.3)] group-hover:scale-105 group-hover:rotate-3 transition-transform duration-200 flex-shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Camera className="w-5 h-5 text-instagram-storyPink" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900 font-serif block leading-none">
                Mini Instagram
              </span>
              <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
                Photo Sharing
              </span>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <NavLink to="/" end className={navLinkClass}>
              <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Home</span>
            </NavLink>

            <NavLink to="/explore" className={navLinkClass}>
              <div className="relative">
                <Compass className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-instagram-storyPink rounded-full" />
              </div>
              <span className="text-sm">Explore</span>
            </NavLink>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center space-x-4 px-3.5 py-3 rounded-xl text-gray-700 hover:bg-gray-50/90 hover:text-black transition-all text-left font-medium group"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px] group-hover:scale-110 transition-transform">
                <div className="w-full h-full bg-white rounded-[6px] flex items-center justify-center">
                  <PlusSquare className="w-4 h-4 text-rose-500" />
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">Create</span>
            </button>

            <NavLink to={`/profile/${currentUserId}`} className={navLinkClass}>
              <div className="w-6 h-6 rounded-full p-[1.5px] story-ring group-hover:scale-110 transition-transform flex-shrink-0">
                <img
                  src={userAvatar}
                  alt={user?.username || 'Profile'}
                  className="w-full h-full rounded-full object-cover border border-white"
                />
              </div>
              <span className="text-sm">Profile</span>
            </NavLink>
          </nav>
        </div>

        {/* User Card & Logout Footer */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/90 border border-gray-200/60 hover:border-gray-300 transition-colors">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="relative flex-shrink-0">
                <img
                  src={userAvatar}
                  alt={user?.username}
                  className="w-9 h-9 rounded-full object-cover border border-white shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Log out"
              className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors flex-shrink-0"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Reusable Create Post Modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </>
  );
};

export default Sidebar;
