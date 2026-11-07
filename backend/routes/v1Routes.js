import express from 'express';
import { signup, login, logout, getMe } from '../controllers/v1/v1AuthController.js';
import { getUploadUrl } from '../controllers/v1/v1MediaController.js';
import {
  createPost,
  getPost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
} from '../controllers/v1/v1PostController.js';
import { getHomeFeed } from '../controllers/v1/v1FeedController.js';
import {
  getUser,
  updateMe,
  followUser,
  unfollowUser,
  getFollowers,
  getUserPosts,
  getSuggestedUsers,
} from '../controllers/v1/v1UserController.js';
import { getNotifications } from '../controllers/v1/v1NotificationController.js';
import { search } from '../controllers/v1/v1SearchController.js';
import { createStory, getActiveStories } from '../controllers/v1/v1StoryController.js';
import { getSystemArchitecture } from '../controllers/v1/v1SystemController.js';

import { protect } from '../middleware/authMiddleware.js';
import { checkIdempotency } from '../middleware/idempotency.js';

const router = express.Router();

// --- Auth Endpoints (Section 4A) ---
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.post('/auth/logout', protect, logout);
router.get('/auth/me', protect, getMe);

// --- Media Endpoints (Section 4A: direct-to-S3 signed URL) ---
router.post('/media/upload-url', protect, getUploadUrl);

// --- Feed Endpoints (Section 4A: cursor paginated & Section 5E: hybrid fanout) ---
router.get('/feed', getHomeFeed);

// --- Posts Endpoints (Section 4A & 4B) ---
router.post('/posts', protect, checkIdempotency, createPost);
router.get('/posts/:id', getPost);
router.delete('/posts/:id', protect, deletePost);
router.post('/posts/:id/like', protect, likePost);
router.delete('/posts/:id/like', protect, unlikePost);
router.post('/posts/:id/comments', protect, addComment);
router.get('/posts/:id/comments', getComments);

// --- Users & Social Graph Endpoints (Section 4A & 4D) ---
router.get('/users/suggested', getSuggestedUsers);
router.patch('/users/me', protect, updateMe);
router.get('/users/:id', getUser);
router.get('/users/:id/posts', getUserPosts);
router.get('/users/:id/followers', getFollowers);
router.post('/users/:id/follow', protect, followUser);
router.delete('/users/:id/follow', protect, unfollowUser);

// --- Auxiliary Services (Section 4A) ---
router.get('/notifications', protect, getNotifications);
router.get('/search', search);
router.post('/stories', protect, createStory);
router.get('/stories', getActiveStories);

// --- System Telemetry & Architecture Specifications ---
router.get('/system/architecture', getSystemArchitecture);

export default router;

