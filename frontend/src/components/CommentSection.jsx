import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CommentSection = ({ postId, initialComments = [], onAddComment }) => {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onAddComment) {
        const newComment = await onAddComment(postId, text.trim());
        if (newComment) {
          setComments((prev) => [...prev, newComment]);
        }
      }
      setText('');
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedComments = showAll ? comments : comments.slice(-3);

  return (
    <div className="pt-2 text-sm">
      {comments.length > 3 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-instagram-secondary hover:text-gray-800 text-xs font-medium mb-1.5 focus:outline-none"
        >
          View all {comments.length} comments
        </button>
      )}

      <div className="space-y-1.5 mb-2 max-h-48 overflow-y-auto">
        {displayedComments.map((comment, index) => {
          const author = comment.user || {};
          const authorName = author.username || 'user';
          const authorId = author._id || author.id;

          return (
            <div key={comment._id || index} className="flex items-start space-x-1.5 text-xs">
              <Link
                to={`/profile/${authorId}`}
                className="font-semibold text-gray-900 hover:underline flex-shrink-0"
              >
                {authorName}
              </Link>
              <span className="text-gray-800 break-words flex-1">{comment.text}</span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center border-t border-instagram-border pt-2 mt-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 text-xs bg-transparent focus:outline-none text-gray-800 placeholder-instagram-secondary"
          maxLength={300}
        />
        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className={`text-xs font-semibold px-2 py-1 transition-colors ${
            text.trim() && !isSubmitting
              ? 'text-instagram-blue hover:text-instagram-hoverBlue'
              : 'text-blue-200 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CommentSection;

