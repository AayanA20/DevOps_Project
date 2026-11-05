import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(getPostById)
  .delete(protect, deletePost);

router.route('/:id/like')
  .post(protect, likePost)
  .delete(protect, unlikePost);

router.route('/:id/comments')
  .get(getComments)
  .post(protect, addComment);

export default router;

