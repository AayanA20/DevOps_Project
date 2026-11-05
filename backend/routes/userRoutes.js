import express from 'express';
import {
  getUserProfile,
  followUser,
  unfollowUser,
  getSuggestedUsers,
  getUploadSignature,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/suggested', getSuggestedUsers);
router.get('/upload-signature', protect, getUploadSignature);
router.get('/:id', getUserProfile);

router.route('/:id/follow')
  .post(protect, followUser)
  .delete(protect, unfollowUser);

export default router;

