import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, PlusSquare, User, LogOut, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import CreatePostModal from './CreatePostModal';
import { postService } from '../services/postService';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreatePost = async (postData) => {
    await postService.createPost(postData);
    // Reload or dispatch event so feed updates
    window.dispatchEvent(new Event('post-created'));
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center space-x-4 p-3 rounded-xl transition-all duration-150 ${
      isActive
        ? 'font-bold text-black bg-gray-100'
        : 'text-gray-700 hover:bg-gray-50 hover:text-black font-normal'
    }`;

  const currentUserId = user?._id || user?.id || '';

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-instagram-border bg-white px-5 py-8 justify-between z-30">
        <div className="space-y-8">
          {/* Logo Header */}
          <NavLink to="/" className="flex items-center space-x-2.5 px-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 font-serif">
              Mini Instagram
            </span>
          </NavLink>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <NavLink to="/" end className={navLinkClass}>
              <Home className="w-6 h-6" />
              <span className="text-sm">Home</span>
            </NavLink>

            <NavLink to="/explore" className={navLinkClass}>
              <Compass className="w-6 h-6" />
              <span className="text-sm">Explore</span>
            </NavLink>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center space-x-4 p-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-black transition-all text-left"
            >
              <PlusSquare className="w-6 h-6 text-instagram-blue" />
              <span className="text-sm font-medium">Create</span>
            </button>

            <NavLink to={`/profile/${currentUserId}`} className={navLinkClass}>
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="w-6 h-6 rounded-full object-cover border border-instagram-border"
                />
              ) : (
                <User className="w-6 h-6" />
              )}
              <span className="text-sm">Profile</span>
            </NavLink>
          </nav>
        </div>

        {/* User Card & Logout Footer */}
        <div className="pt-4 border-t border-instagram-border">
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <img
                src={
                  user?.profilePicture ||
                  `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`
                }
                alt={user?.username}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Log out"
              className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
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
