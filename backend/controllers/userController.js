import User from '../models/User.js';
import Post from '../models/Post.js';
import { generateUploadSignature } from '../config/cloudinary.js';

// @desc    Get user profile by ID with their posts
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture');

    return res.status(200).json({
      success: true,
      user,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Check if already following
    const isAlreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId.toString()
    );

    if (isAlreadyFollowing) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `You are now following ${targetUser.username}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
export const unfollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId.toString()
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `You have unfollowed ${targetUser.username}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get suggested community users
// @route   GET /api/users/suggested
// @access  Public
export const getSuggestedUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user?._id;
    const filter = currentUserId ? { _id: { $ne: currentUserId } } : {};

    const users = await User.find(filter)
      .select('-password')
      .limit(15)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate signed upload parameters for Cloudinary
// @route   GET /api/users/upload-signature
// @access  Private
export const getUploadSignature = async (req, res, next) => {
  try {
    const signatureData = generateUploadSignature('mini_instagram_posts');
    return res.status(200).json({
      success: true,
      ...signatureData,
    });
  } catch (error) {
    next(error);
  }
};

