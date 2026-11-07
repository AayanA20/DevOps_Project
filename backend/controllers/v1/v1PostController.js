import Post from '../../models/Post.js';
import User from '../../models/User.js';
import eventBus from '../../services/eventBus.js';
import cacheService from '../../services/cacheService.js';

// @desc    Create a post after media is uploaded (Phase 4A & 4B)
// @route   POST /api/v1/posts
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const { caption = '', mediaKey, mediaType = 'IMAGE', imageUrl } = req.body;
    const finalMediaKey = mediaKey || (imageUrl ? `raw/${imageUrl.split('/').pop()}` : '');
    const finalImageUrl = imageUrl || `https://cdn.example.com/${finalMediaKey}`;

    if (!finalMediaKey && !finalImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'mediaKey or imageUrl is required',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'mediaKey or imageUrl is required',
        },
      });
    }

    const idempotencyKey = req.headers['idempotency-key'] || null;

    // Check if post with this idempotency key already created
    if (idempotencyKey) {
      const existing = await Post.findOne({ idempotencyKey, user: req.user._id });
      if (existing) {
        return res.status(201).json({
          postId: existing._id,
          userId: existing.user,
          status: existing.status,
          createdAt: existing.createdAt,
          post: existing,
        });
      }
    }

    // Step 7 in Figure 2: Write post with initial status PROCESSING
    const post = await Post.create({
      user: req.user._id,
      mediaKey: finalMediaKey,
      mediaType,
      imageUrl: finalImageUrl,
      caption: caption || '',
      status: 'PROCESSING',
      idempotencyKey,
      likes: [],
      comments: [],
    });

    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'username profilePicture'
    );

    // Cache post hash (Section 4D: post:{postId})
    await cacheService.hsetall(
      `post:${post._id}`,
      {
        _id: post._id.toString(),
        userId: req.user._id.toString(),
        caption: post.caption,
        mediaKey: post.mediaKey,
        imageUrl: post.imageUrl,
        status: 'PROCESSING',
        createdAt: post.createdAt.toISOString(),
      },
      3600
    );

    // Step 9 in Figure 2: Transactional Outbox relay publishes POST_CREATED
    await eventBus.publish('post-events', req.user._id, 'POST_CREATED', {
      postId: post._id.toString(),
      userId: req.user._id.toString(),
      mediaKey: post.mediaKey,
      caption: post.caption,
      createdAt: post.createdAt.toISOString(),
    });

    // Step 8 in Figure 2: Return 201 Created immediately with status PROCESSING
    return res.status(201).json({
      postId: post._id,
      userId: req.user._id,
      status: 'PROCESSING',
      createdAt: post.createdAt,
      post: populatedPost, // Included for frontend React state
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get one post (Phase 4A)
// @route   GET /api/v1/posts/:id
// @access  Public (or Private)
export const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check Redis post hash cache first (cache-aside)
    const cachedPost = await cacheService.hgetall(`post:${id}`);
    if (cachedPost && cachedPost._id) {
      return res.status(200).json({
        success: true,
        post: cachedPost,
      });
    }

    const post = await Post.findById(id)
      .populate('user', 'username profilePicture bio')
      .populate('comments.user', 'username profilePicture');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        error: {
          code: 'POST_NOT_FOUND',
          message: 'The requested post does not exist',
        },
      });
    }

    // Populate Redis cache
    await cacheService.hsetall(
      `post:${post._id}`,
      {
        _id: post._id.toString(),
        userId: post.user._id.toString(),
        caption: post.caption,
        imageUrl: post.imageUrl,
        status: post.status,
        likeCount: post.likes.length,
        commentCount: post.comments.length,
        createdAt: post.createdAt.toISOString(),
      },
      3600
    );

    return res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete own post (Phase 4A)
// @route   DELETE /api/v1/posts/:id
// @access  Private (Owner only)
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        error: {
          code: 'POST_NOT_FOUND',
          message: 'The post could not be found',
        },
      });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own posts',
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own posts',
        },
      });
    }

    await post.deleteOne();

    // Invalidate Redis caches
    await cacheService.del(`post:${req.params.id}`);
    await cacheService.del(`likes:count:${req.params.id}`);

    // Section 4A table: 204 No Content
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// @desc    Like a post (Phase 4A & 4B - Idempotent write)
// @route   POST /api/v1/posts/:id/like
// @access  Private
export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found',
        },
      });
    }

    const userIdStr = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userIdStr);

    if (!alreadyLiked) {
      post.likes.push(req.user._id);
      await post.save();

      // Atomic increment in Redis (Section 5A: like counter)
      await cacheService.incr(`likes:count:${post._id}`);

      // Publish LIKE_CREATED to engagement-events topic
      await eventBus.publish('engagement-events', post._id.toString(), 'LIKE_CREATED', {
        action: 'LIKE_ADDED',
        postId: post._id.toString(),
        senderId: req.user._id.toString(),
        recipientId: post.user.toString(),
        type: 'LIKE',
      });
    }

    // Idempotent response - repeating returns identical state (Section 4B Example 5)
    return res.status(200).json({
      postId: post._id,
      liked: true,
      likeCount: post.likes.length,
      likesCount: post.likes.length, // backwards-compatible
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlike a post (Phase 4A & 4B)
// @route   DELETE /api/v1/posts/:id/like
// @access  Private
export const unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found',
        },
      });
    }

    const userIdStr = req.user._id.toString();
    const hadLiked = post.likes.some((id) => id.toString() === userIdStr);

    if (hadLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
      await post.save();

      await cacheService.decr(`likes:count:${post._id}`);

      await eventBus.publish('engagement-events', post._id.toString(), 'LIKE_REMOVED', {
        action: 'LIKE_REMOVED',
        postId: post._id.toString(),
        senderId: req.user._id.toString(),
      });
    }

    return res.status(200).json({
      postId: post._id,
      liked: false,
      likeCount: post.likes.length,
      likesCount: post.likes.length,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment (Phase 4A & 4B)
// @route   POST /api/v1/posts/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Comment text cannot be empty',
        },
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found',
        },
      });
    }

    const newComment = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    const createdComment = post.comments[post.comments.length - 1];

    // Publish COMMENT_CREATED to engagement-events topic
    await eventBus.publish('engagement-events', post._id.toString(), 'COMMENT_CREATED', {
      action: 'COMMENT_ADDED',
      postId: post._id.toString(),
      commentId: createdComment._id.toString(),
      senderId: req.user._id.toString(),
      recipientId: post.user.toString(),
      type: 'COMMENT',
    });

    // Format response matching Section 4B Example 6
    return res.status(201).json({
      commentId: createdComment._id,
      postId: post._id,
      userId: req.user._id,
      text: createdComment.text,
      createdAt: createdComment.createdAt,
      comment: {
        _id: createdComment._id,
        text: createdComment.text,
        createdAt: createdComment.createdAt,
        user: {
          _id: req.user._id,
          username: req.user.username,
          profilePicture: req.user.profilePicture,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List comments for a post (Phase 4A)
// @route   GET /api/v1/posts/:id/comments
// @access  Public (or Private)
export const getComments = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'comments.user',
      'username profilePicture'
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found',
        },
      });
    }

    return res.status(200).json({
      success: true,
      comments: post.comments,
    });
  } catch (error) {
    next(error);
  }
};
