import User from '../models/User.js';
import Post from '../models/Post.js';
import { generateUploadSignature } from '../config/cloudinary.js';

// @desc    Get user profile by ID with their posts (respects private account privacy)
// @route   GET /api/users/:id
// @access  Public (with optional user context)
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username profilePicture bio followers following isPrivate')
      .populate('following', 'username profilePicture bio followers following isPrivate')
      .populate('followRequests', 'username profilePicture bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUserId = req.user?._id || req.user?.id;
    const isMe = currentUserId && user._id.toString() === currentUserId.toString();

    const isFollowing =
      currentUserId &&
      (user.followers || []).some(
        (f) => (f._id || f).toString() === currentUserId.toString()
      );

    const hasRequested =
      currentUserId &&
      (user.followRequests || []).some(
        (r) => (r._id || r).toString() === currentUserId.toString()
      );

    // Privacy Gate: If account is private and viewer is neither owner nor approved follower
    const isPrivate = Boolean(user.isPrivate);
    const canViewPosts = !isPrivate || isMe || isFollowing;

    let posts = [];
    if (canViewPosts) {
      posts = await Post.find({ user: user._id })
        .sort({ createdAt: -1 })
        .populate('user', 'username profilePicture');
    }

    return res.status(200).json({
      success: true,
      user,
      posts,
      isFollowing: Boolean(isFollowing),
      hasRequested: Boolean(hasRequested),
      canViewPosts,
      isPrivate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (bio, profilePicture, isPrivate)
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { bio, profilePicture, isPrivate } = req.body;

    if (typeof bio !== 'undefined') {
      user.bio = bio;
    }

    if (typeof profilePicture !== 'undefined') {
      user.profilePicture = profilePicture;
    }

    if (typeof isPrivate !== 'undefined') {
      user.isPrivate = Boolean(isPrivate);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        isPrivate: user.isPrivate,
        followers: user.followers,
        following: user.following,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow a user (immediate for public accounts, request-based for private accounts)
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
    const isAlreadyFollowing = (currentUser.following || []).some(
      (id) => id.toString() === targetUserId.toString()
    );

    if (isAlreadyFollowing) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    // If target account is private, send follow request for owner's approval
    if (targetUser.isPrivate) {
      const alreadyRequested = (targetUser.followRequests || []).some(
        (id) => id.toString() === currentUserId.toString()
      );

      if (alreadyRequested) {
        return res.status(200).json({
          success: true,
          status: 'requested',
          message: 'Follow request is already pending approval',
        });
      }

      targetUser.followRequests = targetUser.followRequests || [];
      targetUser.followRequests.push(currentUserId);
      await targetUser.save();

      return res.status(200).json({
        success: true,
        status: 'requested',
        message: `Follow request sent to ${targetUser.username}. Awaiting approval.`,
      });
    }

    // If target account is public, directly follow
    currentUser.following = currentUser.following || [];
    targetUser.followers = targetUser.followers || [];

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({
      success: true,
      status: 'following',
      message: `You are now following ${targetUser.username}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user or cancel pending follow request
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

    currentUser.following = (currentUser.following || []).filter(
      (id) => id.toString() !== targetUserId.toString()
    );
    targetUser.followers = (targetUser.followers || []).filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    // Also remove from pending requests if user cancels request
    targetUser.followRequests = (targetUser.followRequests || []).filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({
      success: true,
      status: 'unfollowed',
      message: `Unfollowed or cancelled request for ${targetUser.username}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending follow requests for the authenticated user
// @route   GET /api/users/requests
// @access  Private
export const getFollowRequests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'followRequests',
      'username profilePicture bio email'
    );

    return res.status(200).json({
      success: true,
      requests: user?.followRequests || [],
      count: (user?.followRequests || []).length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a pending follow request
// @route   POST /api/users/requests/:requesterId
// @access  Private
export const respondFollowRequest = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const { requesterId } = req.params;
    const currentUserId = req.user._id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: "Action must be either 'approve' or 'reject'" });
    }

    const requester = await User.findById(requesterId);
    if (!requester) {
      return res.status(404).json({ message: 'Requester user not found' });
    }

    if (action === 'approve') {
      // 1. Remove from currentUser followRequests & add to currentUser followers atomically
      const updatedCurrentUser = await User.findByIdAndUpdate(
        currentUserId,
        {
          $pull: { followRequests: requesterId },
          $addToSet: { followers: requesterId },
        },
        { new: true }
      )
        .select('-password')
        .populate('followers', 'username profilePicture bio followers following isPrivate')
        .populate('following', 'username profilePicture bio followers following isPrivate')
        .populate('followRequests', 'username profilePicture bio');

      // 2. Add currentUser to requester's following atomically
      await User.findByIdAndUpdate(requesterId, {
        $addToSet: { following: currentUserId },
      });

      return res.status(200).json({
        success: true,
        action: 'approve',
        message: `Approved ${requester.username}'s follow request`,
        user: updatedCurrentUser,
      });
    } else {
      // Reject: Remove from followRequests atomically
      const updatedCurrentUser = await User.findByIdAndUpdate(
        currentUserId,
        {
          $pull: { followRequests: requesterId },
        },
        { new: true }
      )
        .select('-password')
        .populate('followers', 'username profilePicture bio followers following isPrivate')
        .populate('following', 'username profilePicture bio followers following isPrivate')
        .populate('followRequests', 'username profilePicture bio');

      return res.status(200).json({
        success: true,
        action: 'reject',
        message: `Rejected ${requester.username}'s follow request`,
        user: updatedCurrentUser,
      });
    }
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

// @desc    Get user followers list
// @route   GET /api/users/:id/followers
// @access  Public (respects private account privacy)
export const getUserFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username isPrivate followers')
      .populate('followers', 'username profilePicture bio followers following isPrivate');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUserId = req.user?._id || req.user?.id;
    const isMe = currentUserId && user._id.toString() === currentUserId.toString();
    const isFollowing =
      currentUserId &&
      (user.followers || []).some(
        (f) => (f._id || f).toString() === currentUserId.toString()
      );

    if (user.isPrivate && !isMe && !isFollowing) {
      return res.status(403).json({ message: 'This account is private', followers: [] });
    }

    return res.status(200).json({
      success: true,
      followers: user.followers || [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user following list
// @route   GET /api/users/:id/following
// @access  Public (respects private account privacy)
export const getUserFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username isPrivate following followers')
      .populate('following', 'username profilePicture bio followers following isPrivate');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUserId = req.user?._id || req.user?.id;
    const isMe = currentUserId && user._id.toString() === currentUserId.toString();
    const isFollowing =
      currentUserId &&
      (user.followers || []).some(
        (f) => (f._id || f).toString() === currentUserId.toString()
      );

    if (user.isPrivate && !isMe && !isFollowing) {
      return res.status(403).json({ message: 'This account is private', following: [] });
    }

    return res.status(200).json({
      success: true,
      following: user.following || [],
    });
  } catch (error) {
    next(error);
  }
};
