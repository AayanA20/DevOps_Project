import User from '../../models/User.js';
import { generateTokens } from '../../middleware/authMiddleware.js';
import cacheService from '../../services/cacheService.js';

// @desc    Register a new user (Phase 4A & 4B)
// @route   POST /api/v1/auth/signup
// @access  Public
export const signup = async (req, res, next) => {
  try {
    const { username, email, password, bio, profilePicture } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email and password are required',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username, email and password are required',
        },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 6 characters',
        },
      });
    }

    // Check unique constraints (Strong consistency on PostgreSQL primary - Section 5C)
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists',
        error: {
          code: 'USERNAME_TAKEN',
          message: 'Username already exists',
        },
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
        error: {
          code: 'EMAIL_TAKEN',
          message: 'Email already exists',
        },
      });
    }

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      username
    )}&background=random`;

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      bio: bio || '',
      profilePicture: profilePicture || defaultAvatar,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to user model
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Cache user profile hash (Section 4D: user:{userId})
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

    return res.status(201).json({
      userId: user._id,
      username: user.username,
      accessToken,
      refreshToken,
      user, // included for full-stack frontend compatibility
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log in, receive access and refresh tokens (Phase 4A & 4B)
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/username and password are required',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email or username and password are required',
        },
      });
    }

    const query = email ? { email: email.toLowerCase() } : { username };
    const user = await User.findOne(query);

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Update refresh token list and save
    user.refreshTokens.push(refreshToken);
    await user.save();

    return res.status(200).json({
      userId: user._id,
      username: user.username,
      accessToken,
      refreshToken,
      token: accessToken, // included for backwards-compatibility
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Invalidate refresh token session (Phase 4A)
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Invalidate Redis session key (Section 4D: session:{token})
      await cacheService.del(`session:${refreshToken}`);

      if (req.user?._id) {
        await User.findByIdAndUpdate(req.user._id, {
          $pull: { refreshTokens: refreshToken },
        });
      }
    }

    // 204 No Content as specified in Section 4A table
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
