import Story from '../../models/Story.js';

// @desc    Create a 24-hour story (Phase 4A)
// @route   POST /api/v1/stories
// @access  Private
export const createStory = async (req, res, next) => {
  try {
    const { mediaUrl, mediaKey } = req.body;

    if (!mediaUrl && !mediaKey) {
      return res.status(400).json({
        success: false,
        message: 'mediaUrl or mediaKey is required',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'mediaUrl or mediaKey is required for story creation',
        },
      });
    }

    const story = await Story.create({
      user: req.user._id,
      mediaUrl: mediaUrl || `https://cdn.example.com/${mediaKey}`,
      mediaKey: mediaKey || '',
    });

    const populated = await Story.findById(story._id).populate(
      'user',
      'username profilePicture'
    );

    return res.status(201).json({
      success: true,
      story: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active stories (< 24 hours)
// @route   GET /api/v1/stories
// @access  Public
export const getActiveStories = async (req, res, next) => {
  try {
    const stories = await Story.find({
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture');

    return res.status(200).json({
      success: true,
      stories,
    });
  } catch (error) {
    next(error);
  }
};
