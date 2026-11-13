import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const MOCK_STORIES = [
  {
    id: 's1',
    username: 'travel_diaries',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
    storyMedia: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
    hasUnseen: true,
  },
  {
    id: 's2',
    username: 'tech_architect',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop',
    storyMedia: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    hasUnseen: true,
  },
  {
    id: 's3',
    username: 'nature_lens',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop',
    storyMedia: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
    hasUnseen: true,
  },
  {
    id: 's4',
    username: 'urban_shots',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop',
    storyMedia: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&auto=format&fit=crop',
    hasUnseen: true,
  },
  {
    id: 's5',
    username: 'foodie_vibes',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop',
    storyMedia: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop',
    hasUnseen: false,
  },
  {
    id: 's6',
    username: 'campus_life',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop',
    storyMedia: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop',
    hasUnseen: false,
  },
];

const StoriesBar = () => {
  const { user } = useAuth();
  const [activeStory, setActiveStory] = useState(null);
  const [seenStories, setSeenStories] = useState({});

  const handleOpenStory = (story) => {
    setActiveStory(story);
    setSeenStories((prev) => ({ ...prev, [story.id]: true }));
  };

  const userAvatar =
    user?.profilePicture ||
    `https://ui-avatars.com/api/?name=${user?.username || 'You'}&background=random`;

  return (
    <>
      <div className="bg-white border border-instagram-border rounded-xl p-3.5 mb-5 shadow-sm overflow-hidden">
        <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-0.5">
          {/* User's Own Story */}
          <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
            <div className="relative">
              <div className="w-16 h-16 rounded-full p-0.5 bg-gray-100 group-hover:scale-105 transition-transform duration-200">
                <img
                  src={userAvatar}
                  alt="Your story"
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
              </div>
              <div className="absolute bottom-0 right-0 bg-instagram-blue text-white rounded-full p-1 border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-gray-700 mt-1.5 truncate max-w-[68px]">
              Your story
            </span>
          </div>

          {/* Community Stories */}
          {MOCK_STORIES.map((story) => {
            const isSeen = seenStories[story.id] || !story.hasUnseen;
            return (
              <button
                key={story.id}
                onClick={() => handleOpenStory(story)}
                className="flex flex-col items-center flex-shrink-0 group focus:outline-none"
              >
                <div
                  className={`w-16 h-16 rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-105 ${
                    isSeen ? 'story-ring-gray' : 'story-ring'
                  }`}
                >
                  <img
                    src={story.avatar}
                    alt={story.username}
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </div>
                <span className="text-[11px] font-medium text-gray-700 mt-1.5 truncate max-w-[68px] group-hover:text-black">
                  {story.username}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveStory(null)}
        >
          <div
            className="relative max-w-sm w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2.5">
                <img
                  src={activeStory.avatar}
                  alt={activeStory.username}
                  className="w-8 h-8 rounded-full border border-white object-cover"
                />
                <span className="text-xs font-semibold">{activeStory.username}</span>
                <span className="text-[10px] text-white/70">• 3h</span>
              </div>
              <button
                onClick={() => setActiveStory(null)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media */}
            <img
              src={activeStory.storyMedia}
              alt={activeStory.username}
              className="w-full h-[520px] object-cover"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default StoriesBar;
