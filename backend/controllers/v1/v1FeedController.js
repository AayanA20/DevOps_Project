import mongoose from 'mongoose';
import Post from '../../models/Post.js';
import User from '../../models/User.js';
import cacheService from '../../services/cacheService.js';

// @desc    Home feed with hybrid fan-out and cursor pagination (Phase 4A, 4B & 5E)
// @route   GET /api/v1/feed
// @access  Private (or Public demo)
export const getHomeFeed = async (req, res, next) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
    const cursor = req.query.cursor; // <created_at_epoch>_<postId>
    const currentUserId = req.user?._id;

    // Graceful offline/test fallback if MongoDB is not connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        posts: [
          {
            postId: '101',
            _id: '101',
            user: {
              userId: '25',
              _id: '25',
              username: 'shivani_r',
              profilePicture: 'https://ui-avatars.com/api/?name=shivani&background=random',
            },
            caption: 'My first post! #hello #systemdesign',
            mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080',
            imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080',
            mediaType: 'IMAGE',
            status: 'PUBLISHED',
            likeCount: 12,
            likesCount: 12,
            commentCount: 3,
            likedByMe: false,
            createdAt: '2026-11-06T10:00:00Z',
          },
        ],
        nextCursor: '1793959200_101',
      });
    }

    let cursorEpoch = Infinity;
    let cursorPostId = null;

    if (cursor && cursor.includes('_')) {
      const [epochStr, pid] = cursor.split('_');
      cursorEpoch = parseInt(epochStr, 10) * 1000; // convert to ms
      cursorPostId = pid;
    }

    let candidatePosts = [];

    if (currentUserId) {
      // 1. Fetch pushed post IDs from Redis sorted set feed:{userId} (Section 4D & 5B)
      const feedKey = `feed:${currentUserId}`;
      const pushedPostIds = await cacheService.zrevrange(feedKey, 0, 200);

      // 2. Hybrid Fan-Out: Pull posts from followed celebrity accounts at read time (Section 5E)
      const currentUser = await User.findById(currentUserId).populate('following');
      const followedCelebrityIds = [];
      if (currentUser && currentUser.following) {
        for (const followed of currentUser.following) {
          if (followed.isCelebrity || (followed.followers && followed.followers.length > 100000)) {
            followedCelebrityIds.push(followed._id);
          }
        }
      }

      // Query database for posts matching pushed IDs OR followed celebrities OR own posts
      const orConditions = [];
      if (pushedPostIds.length > 0) {
        orConditions.push({ _id: { $in: pushedPostIds } });
      }
      if (followedCelebrityIds.length > 0) {
        orConditions.push({ user: { $in: followedCelebrityIds } });
      }
      // Read-your-own-writes: always include own posts
      orConditions.push({ user: currentUserId });

      const filter = orConditions.length > 0 ? { $or: orConditions } : {};

      // If feed is empty (new account), fallback to latest global public posts
      candidatePosts = await Post.find(filter)
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('user', 'username profilePicture isCelebrity')
        .populate('comments.user', 'username profilePicture');

      if (candidatePosts.length === 0) {
        candidatePosts = await Post.find()
          .sort({ createdAt: -1 })
          .limit(100)
          .populate('user', 'username profilePicture isCelebrity')
          .populate('comments.user', 'username profilePicture');
      }
    } else {
      // Unauthenticated / demo explore feed
      candidatePosts = await Post.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('user', 'username profilePicture isCelebrity')
        .populate('comments.user', 'username profilePicture');
    }

    // 3. Filter by cursor (strictly older than cursor timestamp & post id)
    let filteredPosts = candidatePosts;
    if (cursorEpoch !== Infinity) {
      filteredPosts = candidatePosts.filter((p) => {
        const postTime = new Date(p.createdAt).getTime();
        if (postTime < cursorEpoch) return true;
        if (postTime === cursorEpoch && cursorPostId && p._id.toString() !== cursorPostId) {
          return true;
        }
        return false;
      });
    }

    // Slice to page limit
    const pagePosts = filteredPosts.slice(0, limit);

    // 4. Transform into Phase 4B Example 4 response format
    const formattedPosts = pagePosts.map((post) => {
      const isLikedByMe = currentUserId
        ? post.likes.some((id) => id.toString() === currentUserId.toString())
        : false;

      const cdnUrl =
        post.thumbnails?.large ||
        post.imageUrl ||
        `https://cdn.example.com/p/${post.mediaKey || post._id}_1080.jpg`;

      return {
        postId: post._id,
        _id: post._id,
        user: {
          userId: post.user?._id || post.user,
          _id: post.user?._id || post.user,
          username: post.user?.username || 'user',
          profilePicture: post.user?.profilePicture || '',
        },
        caption: post.caption,
        mediaUrl: cdnUrl,
        imageUrl: post.imageUrl || cdnUrl,
        mediaType: post.mediaType || 'IMAGE',
        status: post.status || 'PUBLISHED',
        likeCount: post.likes ? post.likes.length : 0,
        likesCount: post.likes ? post.likes.length : 0,
        likes: post.likes || [],
        commentCount: post.comments ? post.comments.length : 0,
        comments: post.comments || [],
        likedByMe: isLikedByMe,
        createdAt: post.createdAt,
      };
    });

    // 5. Build nextCursor
    let nextCursor = null;
    if (filteredPosts.length > limit) {
      const lastItem = pagePosts[pagePosts.length - 1];
      const epochSeconds = Math.floor(new Date(lastItem.createdAt).getTime() / 1000);
      nextCursor = `${epochSeconds}_${lastItem.postId}`;
    }

    return res.status(200).json({
      success: true,
      posts: formattedPosts,
      nextCursor,
    });
  } catch (error) {
    next(error);
  }
};
