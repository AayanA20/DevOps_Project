import React, { useState } from 'react';
import { Heart } from 'lucide-react';

const LikeButton = ({ isLiked: initialIsLiked, likesCount: initialCount, onToggle }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  const handleClick = async () => {
    // Optimistic UI update
    const nextState = !isLiked;
    setIsLiked(nextState);
    setCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    try {
      if (onToggle) {
        await onToggle(nextState);
      }
    } catch (err) {
      // Revert on error
      setIsLiked(!nextState);
      setCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={handleClick}
        className="focus:outline-none transition-transform active:scale-125"
        title={isLiked ? 'Unlike' : 'Like'}
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        <Heart
          className={`w-6 h-6 transition-colors duration-200 ${
            isLiked
              ? 'fill-red-500 text-red-500'
              : 'text-gray-800 hover:text-gray-500'
          } ${animating ? 'scale-125' : 'scale-100'}`}
        />
      </button>
      {count > 0 && (
        <span className="text-sm font-semibold text-gray-900 select-none">
          {count.toLocaleString()} {count === 1 ? 'like' : 'likes'}
        </span>
      )}
    </div>
  );
};

export default LikeButton;
