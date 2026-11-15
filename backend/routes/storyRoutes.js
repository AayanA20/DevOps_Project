import express from 'express';
import {
  createStory,
  getActiveStories,
  deleteStory,
} from '../controllers/v1/v1StoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getActiveStories)
  .post(protect, createStory);

router.route('/:id')
  .delete(protect, deleteStory);

export default router;
