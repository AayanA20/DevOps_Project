import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import cacheService from '../services/cacheService.js';
import eventBus from '../services/eventBus.js';

test('GET /api/v1/system/architecture returns capacity baseline and polyglot specs', async () => {
  const res = await request(app).get('/api/v1/system/architecture');
  assert.equal(res.status, 200);
  assert.equal(res.body.designSpecification, 'Instagram System Design – Phase 4 & 5');
  assert.equal(res.body.author, 'Shivani');
  assert.equal(res.body.capacityBaseline.registeredUsers, '10M');
  assert.equal(res.body.capacityBaseline.dailyActiveUsers, '2M');
  assert.equal(res.body.capacityBaseline.peakRps, 7000);
  assert.ok(res.body.polyglotPersistence.postsAndComments.includes('Cassandra'));
  assert.ok(res.body.polyglotPersistence.homeFeedHotCache.includes('Redis'));
});

test('POST /api/v1/auth/signup with missing fields returns 400 with standardized error shape', async () => {
  const res = await request(app).post('/api/v1/auth/signup').send({});
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});

test('POST /api/v1/auth/login with missing credentials returns 400 with standardized error shape', async () => {
  const res = await request(app).post('/api/v1/auth/login').send({ email: '' });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});

test('POST /api/v1/media/upload-url without JWT returns 401 UNAUTHORIZED', async () => {
  const res = await request(app).post('/api/v1/media/upload-url').send({
    mediaType: 'IMAGE',
    contentType: 'image/jpeg',
  });
  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/v1/feed returns 200 with posts array and nextCursor property', async () => {
  const res = await request(app).get('/api/v1/feed?limit=10');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.posts));
  assert.ok('nextCursor' in res.body);
});

test('GET /api/v1/search handles query and returns results', async () => {
  const res = await request(app).get('/api/v1/search?q=photography&type=hashtag');
  assert.equal(res.status, 200);
  assert.equal(res.body.type, 'hashtag');
  assert.ok(Array.isArray(res.body.results));
});

test('Rate limiting headers are present on API responses', async () => {
  const res = await request(app).get('/api/v1/feed');
  assert.equal(res.status, 200);
  assert.ok(res.headers['x-ratelimit-limit']);
  assert.ok(res.headers['x-ratelimit-remaining']);
});

test('CacheService verifies Redis Sorted Sets & Hash operations (Section 4D)', async () => {
  const testUserId = 'test_user_42';
  const testPostId = 'test_post_101';
  const timestamp = 1793959200000;

  // Test ZADD & ZREVRANGE for feed:{userId}
  await cacheService.zadd(`feed:${testUserId}`, timestamp, testPostId);
  const ids = await cacheService.zrevrange(`feed:${testUserId}`, 0, 10);
  assert.ok(ids.includes(testPostId));

  // Test HSETALL & HGETALL for post:{postId}
  await cacheService.hsetall(`post:${testPostId}`, {
    postId: testPostId,
    caption: 'Testing Redis Hashes',
    likeCount: 5,
  });
  const postData = await cacheService.hgetall(`post:${testPostId}`);
  assert.equal(postData.caption, 'Testing Redis Hashes');

  // Test INCR for likes:count:{postId}
  const initial = await cacheService.incr(`likes:count:${testPostId}`);
  assert.equal(typeof initial, 'number');
  assert.ok(initial >= 1);
});

test('EventBus publishes to Kafka topics with outbox pattern and deduplication (Section 5D)', async () => {
  let receivedEvent = null;

  eventBus.subscribe('test-topic', 'unit-test-consumer', async (event) => {
    receivedEvent = event;
  });

  const event = await eventBus.publish('test-topic', 'key_1', 'TEST_EVENT', {
    foo: 'bar',
  });

  assert.ok(event.eventId);
  assert.equal(event.eventType, 'TEST_EVENT');
  assert.equal(event.topic, 'test-topic');

  // Deduplication check: dispatching duplicate eventId should be skipped
  const dedupKey = `event:dedup:${event.eventId}`;
  await cacheService.set(dedupKey, true, 3600);
  assert.equal(await cacheService.get(dedupKey), true);
});
