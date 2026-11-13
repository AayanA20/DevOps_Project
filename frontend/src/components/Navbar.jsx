import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, PlusSquare, User, LogOut, Camera, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import CreatePostModal from './CreatePostModal';
import { postService } from '../services/postService';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUserId = user?._id || user?.id || '';

  const handleCreatePost = async (postData) => {
    await postService.createPost(postData);
    window.dispatchEvent(new Event('post-created'));
    navigate('/');
  };

  const userAvatar =
    user?.profilePicture ||
    `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`;

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 py-2.5 flex items-center justify-between z-30 shadow-sm">
        <NavLink to="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl story-ring p-[1.5px] shadow-sm">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Camera className="w-4 h-4 text-instagram-storyPink" />
            </div>
          </div>
          <span className="text-lg font-bold font-serif text-gray-900 tracking-tight">
            Mini Instagram
          </span>
        </NavLink>

        <div className="flex items-center space-x-3">
          <NavLink to="/explore" className="text-gray-700 hover:text-black p-1">
            <Heart className="w-5 h-5" />
          </NavLink>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-rose-600 p-1 rounded-md"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 flex justify-around items-center py-2 z-30 shadow-lg">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `p-2 rounded-xl transition-transform active:scale-95 ${
              isActive ? 'text-black font-bold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Home className="w-6 h-6" />
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `p-2 rounded-xl transition-transform active:scale-95 ${
              isActive ? 'text-black font-bold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Compass className="w-6 h-6" />
        </NavLink>

        <button
          onClick={() => setIsModalOpen(true)}
          className="p-1 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-md text-white active:scale-95 transition-transform"
          aria-label="Create new post"
        >
          <PlusSquare className="w-6 h-6 m-1" />
        </button>

        <NavLink
          to={`/profile/${currentUserId}`}
          className={({ isActive }) =>
            `p-1.5 rounded-full transition-transform active:scale-95 ${
              isActive ? 'ring-2 ring-black' : ''
            }`
          }
        >
          <img
            src={userAvatar}
            alt="Profile"
            className="w-7 h-7 rounded-full object-cover border border-gray-200"
          />
        </NavLink>
      </nav>

      {/* Create Modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </>
  );
};

export default Navbar;
