import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Trash2, MoreHorizontal } from 'lucide-react';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import { useAuth } from '../hooks/useAuth';

const PostCard = ({ post, onLikeToggle, onAddComment, onDeletePost }) => {
  const { user: currentUser } = useAuth();
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

  return (
    <article className="bg-white border border-instagram-border rounded-lg mb-6 overflow-hidden max-w-lg mx-auto shadow-sm">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <Link to={`/profile/${authorId}`} className="flex items-center space-x-3 group">
          <img
            src={author.profilePicture || `https://ui-avatars.com/api/?name=${author.username || 'User'}&background=random`}
            alt={author.username || 'User avatar'}
            className="w-8 h-8 rounded-full object-cover border border-instagram-border"
          />
          <span className="font-semibold text-sm text-gray-900 group-hover:underline">
            {author.username || 'unknown_user'}
          </span>
        </Link>
        <div className="flex items-center space-x-2">
          {isAuthor && onDeletePost && (
            <button
              onClick={() => onDeletePost(post._id || post.id)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Delete post"
              aria-label="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Post Media */}
      <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[600px] overflow-hidden">
        <img
          src={post.imageUrl}
          alt={post.caption || 'Instagram Post'}
          className="w-full h-auto object-contain max-h-[580px]"
          loading="lazy"
        />
      </div>

      {/* Post Actions & Content */}
      <div className="p-3">
        <div className="flex items-center space-x-4 mb-2">
          <LikeButton
            isLiked={isLikedByMe}
            likesCount={likesCount}
            onToggle={(state) => onLikeToggle && onLikeToggle(post._id || post.id, state)}
          />
          <div className="flex items-center space-x-1 text-gray-800">
            <MessageCircle className="w-6 h-6 hover:text-gray-500 cursor-pointer" />
            <span className="text-sm font-semibold">
              {(post.comments && post.comments.length) || 0}
            </span>
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="text-sm mb-2">
            <Link to={`/profile/${authorId}`} className="font-semibold text-gray-900 mr-2 hover:underline">
              {author.username || 'user'}
            </Link>
            <span className="text-gray-800 break-words">{post.caption}</span>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-[10px] uppercase text-instagram-secondary tracking-wide mb-2">
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

