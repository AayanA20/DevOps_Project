import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Trash2, Send, Bookmark, Heart } from 'lucide-react';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import { useAuth } from '../hooks/useAuth';

const PostCard = ({ post, onLikeToggle, onAddComment, onDeletePost }) => {
  const { user: currentUser } = useAuth();
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const author = post.user || {};
  const authorId = author._id || author.id;
  const currentUserId = currentUser?._id || currentUser?.id;
  const isAuthor = currentUserId && authorId && currentUserId.toString() === authorId.toString();

  // Check if current user liked this post
  const isLikedByMe = Array.isArray(post.likes) && post.likes.some((like) => {
    const likeId = typeof like === 'string' ? like : like._id || like.id;
    return likeId && currentUserId && likeId.toString() === currentUserId.toString();
  });

  const likesCount = Array.isArray(post.likes) ? post.likes.length : post.likesCount || 0;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'JUST NOW';
    if (diffInHours < 24) return `${diffInHours}H AGO`;
    return `${Math.floor(diffInHours / 24)}D AGO`;
  };

  // Double tap / double click to like
  const handleMediaDoubleClick = () => {
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 800);
    if (!isLikedByMe && onLikeToggle) {
      onLikeToggle(post._id || post.id, true);
    }
  };

  return (
    <article className="bg-white border border-gray-200/90 rounded-2xl mb-5 overflow-hidden max-w-lg mx-auto shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      {/* Post Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-gray-100/80">
        <Link to={`/profile/${authorId}`} className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-full p-[1.5px] story-ring flex-shrink-0 group-hover:scale-105 transition-transform">
            <img
              src={
                author.profilePicture ||
                `https://ui-avatars.com/api/?name=${author.username || 'User'}&background=random`
              }
              alt={author.username || 'User avatar'}
              className="w-full h-full rounded-full object-cover border-2 border-white"
            />
          </div>
          <div>
            <span className="font-semibold text-sm text-gray-900 group-hover:text-instagram-blue transition-colors block">
              {author.username || 'unknown_user'}
            </span>
            <span className="text-[10px] text-gray-400 font-normal">Original post</span>
          </div>
        </Link>

        <div className="flex items-center space-x-2">
          {isAuthor && onDeletePost && (
            <button
              onClick={() => onDeletePost(post._id || post.id)}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors p-1.5"
              title="Delete post"
              aria-label="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Post Media with Double-Click Heart */}
      <div
        onDoubleClick={handleMediaDoubleClick}
        className="relative bg-zinc-950 flex items-center justify-center min-h-[340px] max-h-[600px] overflow-hidden select-none cursor-pointer"
      >
        <img
          src={post.imageUrl}
          alt={post.caption || 'Instagram Post'}
          className="w-full h-auto object-contain max-h-[580px]"
          loading="lazy"
        />

        {/* Animated Pop-Up Heart */}
        {showHeartOverlay && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <Heart className="w-24 h-24 fill-white text-white drop-shadow-2xl animate-heart-pop" />
          </div>
        )}
      </div>

      {/* Post Actions & Content */}
      <div className="p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-4">
            <LikeButton
              isLiked={isLikedByMe}
              likesCount={likesCount}
              onToggle={(state) => onLikeToggle && onLikeToggle(post._id || post.id, state)}
            />
            <div className="flex items-center space-x-1.5 text-gray-800 hover:text-gray-500 cursor-pointer transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm font-semibold">
                {(post.comments && post.comments.length) || 0}
              </span>
            </div>
            <button
              type="button"
              className="text-gray-800 hover:text-gray-500 transition-colors p-0.5"
              title="Share"
              aria-label="Share post"
            >
              <Send className="w-5 h-5 -rotate-12" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className="text-gray-800 hover:text-black transition-colors"
            title="Save"
            aria-label="Save post"
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-black' : ''}`} />
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="text-sm mb-2 leading-relaxed">
            <Link
              to={`/profile/${authorId}`}
              className="font-semibold text-gray-900 mr-2 hover:underline"
            >
              {author.username || 'user'}
            </Link>
            <span className="text-gray-800 break-words">{post.caption}</span>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-[10px] uppercase font-medium text-gray-400 tracking-wider mb-2">
          {formatDate(post.createdAt)}
        </p>

        {/* Comments Section */}
        <CommentSection
          postId={post._id || post.id}
          initialComments={post.comments || []}
          onAddComment={onAddComment}
        />
      </div>
    </article>
  );
};

export default PostCard;
