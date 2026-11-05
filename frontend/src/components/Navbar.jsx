import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, PlusSquare, User, LogOut, Camera } from 'lucide-react';
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

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 bg-white border-b border-instagram-border px-4 py-3 flex items-center justify-between z-30 shadow-sm">
        <NavLink to="/" className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold font-serif text-gray-900">Mini Instagram</span>
        </NavLink>

        <button
          onClick={logout}
          className="text-gray-600 hover:text-red-500 p-1 rounded-md"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-instagram-border flex justify-around py-2.5 z-30 shadow-md">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? 'text-black' : 'text-gray-500')}
        >
          <Home className="w-6 h-6" />
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) => (isActive ? 'text-black' : 'text-gray-500')}
        >
          <Compass className="w-6 h-6" />
        </NavLink>

        <button
          onClick={() => setIsModalOpen(true)}
          className="text-instagram-blue focus:outline-none"
        >
          <PlusSquare className="w-6 h-6" />
        </button>

        <NavLink
          to={`/profile/${currentUserId}`}
          className={({ isActive }) => (isActive ? 'text-black' : 'text-gray-500')}
        >
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-6 h-6 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <User className="w-6 h-6" />
          )}
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

