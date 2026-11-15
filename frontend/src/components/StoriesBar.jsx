import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Trash2, ChevronLeft, ChevronRight, Sparkles, Clock, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { storyService } from '../services/storyService';
import CreateStoryModal from './CreateStoryModal';

const StoriesBar = () => {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;

  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [seenStories, setSeenStories] = useState({});
  const [storiesList, setStoriesList] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format time ago (e.g., "2h", "45m")
  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${Math.max(1, minutes)}m ago`;
    }
    return `${hours}h ago`;
  };

  // Fetch active stories from backend
  const fetchStories = useCallback(async () => {
    try {
      const res = await storyService.getActiveStories();
      const backendStories = res?.stories || [];

      // Separate current user's stories from other stories
      const mine = [];
      const others = [];

      backendStories.forEach((st) => {
        const authorId = st.user?._id || st.user?.id || st.user;
        const normalized = {
          id: st._id || st.id,
          userId: authorId,
          username: st.user?.username || 'user',
          avatar:
            st.user?.profilePicture ||
            `https://ui-avatars.com/api/?name=${st.user?.username || 'User'}&background=random`,
          storyMedia: st.mediaUrl,
          caption: st.caption || '',
          createdAt: st.createdAt,
          isMine: currentUserId && authorId?.toString() === currentUserId?.toString(),
          hasUnseen: true,
        };

        if (normalized.isMine) {
          mine.push(normalized);
        } else {
          others.push(normalized);
        }
      });

      setMyStories(mine);
      // Strictly show only stories from followed users
      setStoriesList(others);
    } catch (err) {
      console.warn('Could not fetch active stories:', err);
      setMyStories([]);
      setStoriesList([]);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchStories();

    // Listen for custom story or follow change events
    const handleRefresh = () => {
      fetchStories();
    };
    window.addEventListener('story-created', handleRefresh);
    window.addEventListener('follow-status-changed', handleRefresh);
    return () => {
      window.removeEventListener('story-created', handleRefresh);
      window.removeEventListener('follow-status-changed', handleRefresh);
    };
  }, [fetchStories]);

  // Combined stories for the viewer
  const allViewerStories = myStories.length > 0 ? [...myStories, ...storiesList] : storiesList;
  const activeStory = activeStoryIndex !== null ? allViewerStories[activeStoryIndex] : null;

  const handleOpenMyStory = () => {
    if (myStories.length > 0) {
      // Open first story of current user
      setActiveStoryIndex(0);
      setSeenStories((prev) => ({ ...prev, [myStories[0].id]: true }));
    } else {
      setIsCreateOpen(true);
    }
  };

  const handleOpenStory = (story, idx) => {
    const targetIndex = myStories.length > 0 ? idx + myStories.length : idx;
    setActiveStoryIndex(targetIndex);
    setSeenStories((prev) => ({ ...prev, [story.id]: true }));
  };

  const handleNextStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex < allViewerStories.length - 1) {
      const nextIdx = activeStoryIndex + 1;
      setActiveStoryIndex(nextIdx);
      setSeenStories((prev) => ({ ...prev, [allViewerStories[nextIdx].id]: true }));
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      const prevIdx = activeStoryIndex - 1;
      setActiveStoryIndex(prevIdx);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!storyId || !window.confirm('Are you sure you want to delete this story?')) return;
    setIsDeleting(true);
    try {
      await storyService.deleteStory(storyId);
      setActiveStoryIndex(null);
      await fetchStories();
    } catch (err) {
      console.error('Failed to delete story:', err);
      alert('Failed to delete story. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const userAvatar =
    user?.profilePicture ||
    `https://ui-avatars.com/api/?name=${user?.username || 'You'}&background=random`;

  const hasMyStory = myStories.length > 0;

  return (
    <>
      <div className="bg-white border border-instagram-border rounded-xl p-3.5 mb-5 shadow-sm overflow-hidden">
        <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-0.5">
          {/* User's Own Story Button */}
          <div className="flex flex-col items-center flex-shrink-0 group">
            <div className="relative">
              <button
                type="button"
                onClick={handleOpenMyStory}
                className={`w-16 h-16 rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-105 focus:outline-none ${
                  hasMyStory ? 'story-ring' : 'p-0.5 bg-gray-100'
                }`}
                title={hasMyStory ? 'View your story' : 'Add to your story'}
              >
                <img
                  src={userAvatar}
                  alt="Your story"
                  className="w-full h-full rounded-full object-cover border-2 border-white bg-gray-50"
                />
              </button>

              {/* Blue '+' Add Badge */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreateOpen(true);
                }}
                className="absolute bottom-0 right-0 bg-instagram-blue hover:bg-instagram-hoverBlue text-white rounded-full p-1 border-2 border-white shadow-md group-hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                title="Add new story"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
            <span className="text-[11px] font-medium text-gray-700 mt-1.5 truncate max-w-[68px]">
              {hasMyStory ? 'Your story' : 'Add story'}
            </span>
          </div>

          {/* Community Stories */}
          {storiesList.map((story, idx) => {
            const isSeen = seenStories[story.id] || !story.hasUnseen;
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => handleOpenStory(story, idx)}
                className="flex flex-col items-center flex-shrink-0 group focus:outline-none cursor-pointer"
                title={`View ${story.username}'s story`}
              >
                <div
                  className={`w-16 h-16 rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-105 ${
                    isSeen ? 'story-ring-gray' : 'story-ring'
                  }`}
                >
                  <img
                    src={story.avatar}
                    alt={story.username}
                    className="w-full h-full rounded-full object-cover border-2 border-white bg-gray-50"
                  />
                </div>
                <span className="text-[11px] font-medium text-gray-700 mt-1.5 truncate max-w-[68px] group-hover:text-black transition-colors">
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
          onClick={() => setActiveStoryIndex(null)}
        >
          {/* Navigation Prev Button */}
          {activeStoryIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevStory();
              }}
              className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all shadow-lg"
              title="Previous story"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Story Content Box */}
          <div
            className="relative max-w-sm w-full bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between"
            style={{ height: '580px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Animated Progress Bar */}
            <div className="absolute top-0 left-0 right-0 p-3 z-30">
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  key={activeStory.id}
                  className="h-full bg-white rounded-full w-full animate-[shrink_5s_linear_forwards]"
                  onAnimationEnd={handleNextStory}
                />
              </div>
            </div>

            {/* Top Bar (Author, Time, Actions) */}
            <div className="absolute top-4 left-0 right-0 px-4 py-2 z-20 flex items-center justify-between text-white bg-gradient-to-b from-black/80 via-black/40 to-transparent">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white flex-shrink-0">
                  <img
                    src={activeStory.avatar}
                    alt={activeStory.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold truncate max-w-[120px]">
                      {activeStory.username}
                    </span>
                    {activeStory.isMine && (
                      <span className="text-[10px] bg-rose-500/80 px-1.5 py-0.2 rounded-full font-semibold">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-white/70 block">
                    {getTimeAgo(activeStory.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Delete story button (if it's the owner's story) */}
                {activeStory.isMine && (
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleDeleteStory(activeStory.id)}
                    className="p-1.5 rounded-full hover:bg-rose-500/30 text-rose-300 hover:text-rose-100 transition-colors"
                    title="Delete your story"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* Add another story */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStoryIndex(null);
                    setIsCreateOpen(true);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                  title="Add new story"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Close modal */}
                <button
                  type="button"
                  onClick={() => setActiveStoryIndex(null)}
                  className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                  title="Close story"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Clickable Left/Right overlay areas for mobile story tapping */}
            <div className="absolute inset-0 flex z-10">
              <div
                className="w-1/3 h-full cursor-pointer"
                onClick={handlePrevStory}
                title="Previous"
              />
              <div
                className="w-2/3 h-full cursor-pointer"
                onClick={handleNextStory}
                title="Next"
              />
            </div>

            {/* Story Image */}
            <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden">
              <img
                src={activeStory.storyMedia}
                alt={activeStory.caption || `${activeStory.username}'s story`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bottom Caption Overlay */}
            {activeStory.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
                <p className="text-white text-xs font-medium text-center leading-relaxed drop-shadow-md">
                  {activeStory.caption}
                </p>
              </div>
            )}
          </div>

          {/* Navigation Next Button */}
          {activeStoryIndex < allViewerStories.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextStory();
              }}
              className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all shadow-lg"
              title="Next story"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* Add Story Modal */}
      <CreateStoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onStoryCreated={() => {
          fetchStories();
          window.dispatchEvent(new Event('story-created'));
        }}
      />
    </>
  );
};

export default StoriesBar;
