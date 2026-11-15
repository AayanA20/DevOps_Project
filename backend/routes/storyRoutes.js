import express from 'express';
import {
  createStory,
  getActiveStories,
  deleteStory,
} from '../controllers/v1/v1StoryController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(optionalProtect, getActiveStories)
  .post(protect, createStory);

router.route('/:id')
  .delete(protect, deleteStory);

export default router;

