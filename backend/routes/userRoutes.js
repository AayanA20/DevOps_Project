import express from 'express';
import {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowRequests,
  respondFollowRequest,
  getSuggestedUsers,
  getUploadSignature,
  getUserFollowers,
  getUserFollowing,
} from '../controllers/userController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Specific routes MUST come before parametric `/:id` route
router.put('/profile', protect, updateProfile);
router.get('/requests', protect, getFollowRequests);
router.post('/requests/:requesterId', protect, respondFollowRequest);
router.get('/suggested', optionalProtect, getSuggestedUsers);
router.get('/upload-signature', protect, getUploadSignature);

// Parametric sub-routes
router.get('/:id/followers', optionalProtect, getUserFollowers);
router.get('/:id/following', optionalProtect, getUserFollowing);

router.route('/:id/follow')
  .post(protect, followUser)
  .delete(protect, unfollowUser);

router.get('/:id', optionalProtect, getUserProfile);

export default router;
