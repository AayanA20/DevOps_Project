import Post from '../models/Post.js';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const { imageUrl, caption } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const post = await Post.create({
      user: req.user._id,
      imageUrl,
      caption: caption || '',
      likes: [],
      comments: [],
    });

    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'username profilePicture'
    );

    return res.status(201).json({
      success: true,
      post: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts (Feed with pagination)
// @route   GET /api/posts
// @access  Public (or Private)
export const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profilePicture')
      .populate('comments.user', 'username profilePicture');

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username profilePicture bio')
      .populate('comments.user', 'username profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post by ID
// @route   DELETE /api/posts/:id
// @access  Private (Owner only)
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Unauthorized: You can only delete your own posts' });
    }

    await post.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Post removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like a post (Duplicate-like prevention)
// @route   POST /api/posts/:id/like
// @access  Private
export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userIdStr = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userIdStr);

    if (alreadyLiked) {
      return res.status(400).json({ message: 'Post already liked by user' });
    }

    post.likes.push(req.user._id);
    await post.save();

    return res.status(200).json({
      success: true,
      likesCount: post.likes.length,
      message: 'Post liked',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlike a post
// @route   DELETE /api/posts/:id/like
// @access  Private
export const unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userIdStr = req.user._id.toString();
    const initialLength = post.likes.length;

    post.likes = post.likes.filter((id) => id.toString() !== userIdStr);

    if (post.likes.length === initialLength) {
      return res.status(400).json({ message: 'Post has not been liked yet' });
    }

    await post.save();

    return res.status(200).json({
      success: true,
      likesCount: post.likes.length,
      message: 'Post unliked',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text cannot be empty' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Find the newly pushed comment
    const createdComment = post.comments[post.comments.length - 1];

    return res.status(201).json({
      success: true,
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

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Public
export const getComments = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'comments.user',
      'username profilePicture'
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json({
      success: true,
      comments: post.comments,
    });
  } catch (error) {
    next(error);
  }
};
