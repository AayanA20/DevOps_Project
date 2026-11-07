import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [2200, 'Comment cannot exceed 2200 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post author is required'],
      index: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    mediaKey: {
      type: String,
      default: '',
    },
    mediaType: {
      type: String,
      enum: ['IMAGE', 'VIDEO'],
      default: 'IMAGE',
    },
    status: {
      type: String,
      enum: ['PROCESSING', 'PUBLISHED'],
      default: 'PUBLISHED',
    },
    thumbnails: {
      small: { type: String, default: '' },
      medium: { type: String, default: '' },
      large: { type: String, default: '' },
    },
    hashtags: [{ type: String }],
    idempotencyKey: {
      type: String,
      default: null,
      index: true,
    },
    caption: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2200, 'Caption cannot exceed 2200 characters'],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for feed queries ordered newest first (Section 4D)
postSchema.index({ createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
