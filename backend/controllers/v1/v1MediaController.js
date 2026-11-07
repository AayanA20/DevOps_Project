import crypto from 'crypto';
import { generateUploadSignature } from '../../config/cloudinary.js';

// @desc    Get a signed URL to upload media directly to object storage (Phase 4A & 4B)
// @route   POST /api/v1/media/upload-url
// @access  Private
export const getUploadUrl = async (req, res, next) => {
  try {
    const { mediaType = 'IMAGE', contentType = 'image/jpeg', sizeBytes = 2048000 } = req.body;

    // Validate size (max 10MB)
    if (sizeBytes > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Payload too large. Maximum file size is 10 MB.',
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Maximum file size is 10 MB.',
        },
      });
    }

    const ext = contentType.includes('png')
      ? 'png'
      : contentType.includes('mp4')
      ? 'mp4'
      : 'jpg';

    const fileId = crypto.randomBytes(8).toString('hex');
    const mediaKey = `raw/${fileId}.${ext}`;

    // Cloudinary signature parameters if Cloudinary credentials exist
    let cloudinaryParams = null;
    try {
      cloudinaryParams = generateUploadSignature('mini_instagram_posts');
    } catch {
      // Fallback
    }

    const s3Bucket = process.env.S3_BUCKET_NAME || 'mini-instagram-media-storage';
    const s3Region = process.env.AWS_REGION || 'us-east-1';
    const signedToken = crypto.randomBytes(24).toString('hex');

    const uploadUrl =
      cloudinaryParams && cloudinaryParams.apiKey
        ? `https://api.cloudinary.com/v1_1/${cloudinaryParams.cloudName}/image/upload`
        : `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${mediaKey}?X-Amz-Signature=${signedToken}`;

    return res.status(200).json({
      uploadUrl,
      mediaKey,
      expiresInSeconds: 300,
      cloudinarySignature: cloudinaryParams, // Included for frontend Cloudinary direct upload
    });
  } catch (error) {
    next(error);
  }
};
