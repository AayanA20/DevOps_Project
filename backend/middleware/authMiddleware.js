import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import cacheService from '../services/cacheService.js';

export const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'dev_jwt_secret_mini_instagram',
    { expiresIn: '15m' } // 15-minute access token as specified in Section 5A
  );

  const refreshToken = crypto.randomUUID();

  // Store session in Redis for 7 days (Section 4D: session:{token})
  cacheService.set(`session:${refreshToken}`, String(userId), 7 * 24 * 3600);

  return { accessToken, refreshToken };
};

// Backwards-compatible generateToken for existing tests
export const generateToken = (userId) => {
  return generateTokens(userId).accessToken;
};

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify JWT locally at Gateway (Section 5A)
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'dev_jwt_secret_mini_instagram'
      );

      // Check user cache first (cache-aside user:{userId})
      const cachedUser = await cacheService.hgetall(`user:${decoded.id}`);
      if (cachedUser && cachedUser._id) {
        req.user = cachedUser;
        return next();
      }

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found for this token',
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not found for this token',
          },
        });
      }

      // Populate user cache with 1-hour TTL (Section 4D)
      await cacheService.hsetall(
        `user:${req.user._id}`,
        {
          _id: req.user._id.toString(),
          username: req.user.username,
          email: req.user.email,
          profilePicture: req.user.profilePicture || '',
          bio: req.user.bio || '',
        },
        3600
      );

      return next();
    } catch (error) {
      console.error('JWT Verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired',
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized, token failed or expired',
        },
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Not authorized, no token provided',
    error: {
      code: 'UNAUTHORIZED',
      message: 'Not authorized, no token provided',
    },
  });
};
