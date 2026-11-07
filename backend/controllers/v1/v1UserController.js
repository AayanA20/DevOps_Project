import User from '../../models/User.js';
import Post from '../../models/Post.js';
import eventBus from '../../services/eventBus.js';
import cacheService from '../../services/cacheService.js';

// @desc    Get user profile with follower/following counts (Phase 4A)
// @route   GET /api/v1/users/:id
// @access  Public
export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -refreshTokens')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The requested user profile does not exist',
        },
      });
    }

    const postsCount = await Post.countDocuments({ user: user._id });

    return res.status(200).json({
      success: true,
      userId: user._id,
      username: user.username,
      bio: user.bio,
      profilePicture: user.profilePicture,
      followerCount: user.followers.length,
      followingCount: user.following.length,
      postsCount,
      user, // included for full-stack compatibility
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bio or profile photo (Phase 4A)
// @route   PATCH /api/v1/users/me
// @access  Private
export const updateMe = async (req, res, next) => {
  try {
    const { bio, profilePicture } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    // Invalidate & refresh Redis user cache (Section 5B: Read-your-own-writes)
    await cacheService.hsetall(
      `user:${user._id}`,
      {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
      },
      3600
    );

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow a user (Phase 4A & 4B - Idempotent write)
// @route   POST /api/v1/users/:id/follow
// @access  Private
export const followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
        error: {
          code: 'INVALID_OPERATION',
          message: 'Users cannot follow their own account',
        },
      });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found',
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The target user was not found',
        },
      });
    }

    // Check if already following (Idempotent write - Section 4A)
    const alreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId.toString()
    );

    if (!alreadyFollowing) {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);

      await currentUser.save();
      await targetUser.save();

      // Publish USER_FOLLOWED to graph-events (Section 5D)
      await eventBus.publish('graph-events', targetUserId.toString(), 'USER_FOLLOWED', {
        followerId: currentUserId.toString(),
        followingId: targetUserId.toString(),
      });

      // Publish engagement event for notification
      await eventBus.publish('engagement-events', targetUserId.toString(), 'FOLLOW_NOTIFICATION', {
        type: 'FOLLOW',
        senderId: currentUserId.toString(),
        recipientId: targetUserId.toString(),
      });
    }

    // Response matching Section 4B Example 7
    return res.status(200).json({
      followerId: currentUserId,
      followingId: targetUserId,
      status: 'FOLLOWING',
      success: true,
      message: `You are now following ${targetUser.username}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user (Phase 4A)
// @route   DELETE /api/v1/users/:id/follow
// @access  Private
export const unfollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found',
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The target user was not found',
        },
      });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId.toString()
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    await currentUser.save();
    await targetUser.save();

    // Section 4A table: 204 No Content
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// @desc    List followers (Phase 4A)
// @route   GET /api/v1/users/:id/followers
// @access  Public
export const getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'followers',
      'username profilePicture bio'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    return res.status(200).json({
      success: true,
      followers: user.followers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Posts on a profile grid (Phase 4A: posts_by_user)
// @route   GET /api/v1/users/:id/posts
// @access  Public
export const getUserPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture');

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suggested accounts
// @route   GET /api/v1/users/suggested
// @access  Public
export const getSuggestedUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user?._id;
    const filter = currentUserId ? { _id: { $ne: currentUserId } } : {};

    const users = await User.find(filter)
      .select('-password -refreshTokens')
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

