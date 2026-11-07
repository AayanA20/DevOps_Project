import cacheService from '../../services/cacheService.js';
import eventBus from '../../services/eventBus.js';

// @desc    Get system design architecture metadata, capacity specs, and live engine stats
// @route   GET /api/v1/system/architecture
// @access  Public
export const getSystemArchitecture = (req, res) => {
  const capacityBaseline = {
    registeredUsers: '10M',
    dailyActiveUsers: '2M',
    requestsPerDay: '200M',
    averageRps: 2315,
    peakRps: 7000,
    newPostsPerDay: 200000,
    mediaStoragePerYear: '146 TB',
    postMetadataStoragePerYear: '73 GB (220 GB at RF=3)',
    redisFeedClusterMemory: '64 GB (4x16GB)',
  };

  const polyglotPersistence = {
    usersAndAuth: 'PostgreSQL (ACID, sharded by user_id)',
    socialGraph: 'PostgreSQL (sharded by follower_id, reciprocal index on following_id)',
    postsAndComments: 'Cassandra (RF=3, partitioned by user_id, clustered by created_at DESC)',
    likesAndRelationships: 'Cassandra (likes_by_post) + Redis atomic INCR counters',
    homeFeedHotCache: 'Redis Sorted Sets (feed:{userId}, score=epoch)',
    mediaObjectStorage: 'Amazon S3 + CloudFront CDN',
    searchIndex: 'Elasticsearch (inverted hashtag and user index)',
  };

  return res.status(200).json({
    success: true,
    designSpecification: 'Instagram System Design – Phase 4 & 5',
    author: 'Shivani',
    date: '6 November 2026',
    capacityBaseline,
    polyglotPersistence,
    liveTelemetry: {
      cache: cacheService.getStats(),
      eventBus: eventBus.getStats(),
      uptimeSeconds: process.uptime(),
      memoryUsageMb: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
    },
  });
};

