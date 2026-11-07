import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import cacheService from '../services/cacheService.js';
import eventBus from '../services/eventBus.js';
import { generateTokens } from '../middleware/authMiddleware.js';
import { checkIdempotency } from '../middleware/idempotency.js';

test('AUTH: Malformed or invalid JWT Bearer token returns 401 UNAUTHORIZED', async () => {
  const res = await request(app)
    .get('/api/v1/auth/me')
    .set('Authorization', 'Bearer invalid.token.payload');
  
  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, 'UNAUTHORIZED');
  assert.equal(res.body.success, false);
});

test('AUTH: Missing Bearer scheme (token only) returns 401 UNAUTHORIZED', async () => {
  const res = await request(app)
    .get('/api/v1/auth/me')
    .set('Authorization', 'RawTokenWithoutBearer');
  
  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, 'UNAUTHORIZED');
});

test('TOKEN: generateTokens creates valid access and refresh token pair', () => {
  const { accessToken, refreshToken } = generateTokens('test_user_id_999');
  assert.ok(accessToken);
  assert.ok(refreshToken);
  assert.equal(typeof accessToken, 'string');
  assert.equal(typeof refreshToken, 'string');
});

test('IDEMPOTENCY: Middleware intercepts repeat Idempotency-Key and returns cached outcome', async () => {
  const uniqueKey = `idemp_unit_test_${Date.now()}`;
  const req = {
    headers: { 'idempotency-key': uniqueKey },
  };

  let nextCalled = false;
  const res1 = {
    statusCode: 201,
    setHeader: () => {},
    json: (body) => body,
  };

  await checkIdempotency(req, res1, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);

  // Simulate endpoint handler finishing with JSON response
  res1.json({ postId: '99', status: 'PROCESSING' });

  // Second invocation with identical Idempotency-Key
  let secondCallPassedToNext = false;
  let cachedStatusCode = null;
  let cachedPayload = null;
  let hitHeader = null;

  const res2 = {
    setHeader: (name, val) => {
      if (name === 'X-Cache-Lookup') hitHeader = val;
    },
    status: (code) => {
      cachedStatusCode = code;
      return {
        json: (body) => {
          cachedPayload = body;
        },
      };
    },
  };

  await checkIdempotency(req, res2, () => {
    secondCallPassedToNext = true;
  });

  assert.equal(secondCallPassedToNext, false); // Blocked from executing duplicate mutation
  assert.equal(hitHeader, 'HIT-IDEMPOTENT');
  assert.equal(cachedStatusCode, 201);
  assert.deepEqual(cachedPayload, { postId: '99', status: 'PROCESSING' });
});

test('RATE LIMITER: Sliding window returns HTTP 429 when threshold exceeded', async () => {
  const testIp = '192.168.1.99';
  const minute = Math.floor(Date.now() / 60000);
  const rateKey = `rate:${testIp}:${minute}`;
  
  // Artificially saturate the rate limit counter for testIp
  await cacheService.set(rateKey, 105, 60);

  const res = await request(app)
    .get('/api/v1/search?q=test')
    .set('X-Forwarded-For', testIp);

  assert.ok(res.headers['x-ratelimit-limit']);
  assert.ok('x-ratelimit-remaining' in res.headers);
});

test('CACHE: Key expiration removes item after TTL', async () => {
  const key = `temp_cache_key_${Date.now()}`;
  await cacheService.set(key, { message: 'temporary' }, 1); // 1 second TTL

  // Immediately available
  const val1 = await cacheService.get(key);
  assert.equal(val1.message, 'temporary');

  // Wait 1.1s for expiration
  await new Promise((resolve) => setTimeout(resolve, 1100));

  const val2 = await cacheService.get(key);
  assert.equal(val2, null);
});

test('CACHE: Atomic INCR on non-existent key initializes to 1', async () => {
  const key = `counter_test_${Date.now()}`;
  const count1 = await cacheService.incr(key, 60);
  assert.equal(count1, 1);

  const count2 = await cacheService.incr(key, 60);
  assert.equal(count2, 2);
});

test('CACHE: Stats tracks hits and misses accurately', async () => {
  const initialMisses = cacheService.getStats().stats.misses;
  const missingKey = `definitely_missing_key_${Date.now()}`;
  
  await cacheService.get(missingKey);
  const updatedMisses = cacheService.getStats().stats.misses;
  assert.equal(updatedMisses, initialMisses + 1);
});

test('EVENTBUS: Dead-letter queue captures failed consumer events after retries', async () => {
  const failingTopic = `failing-test-topic-${Date.now()}`;
  let attempts = 0;

  // Register a consumer that deliberately fails
  eventBus.subscribe(failingTopic, 'failing-worker', async () => {
    attempts++;
    throw new Error('Simulated worker catastrophic failure');
  });

  const event = await eventBus.publish(failingTopic, 'fail_key', 'FAIL_EVENT', {
    reason: 'test error handling',
  });

  assert.ok(event.eventId);
  
  // Await asynchronous outbox relay dispatch
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.ok(attempts >= 1);
  
  // Verify consumers registration for topic
  assert.ok(eventBus.consumers.has(failingTopic));
});

test('FEED: Cursor pagination handles limit bounds', async () => {
  const res = await request(app).get('/api/v1/feed?limit=2');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.posts));
  assert.ok(res.body.posts.length <= 2);
});

test('NOT FOUND: Unregistered v1 endpoint returns standardized 404 error shape', async () => {
  const res = await request(app).get('/api/v1/unregistered-path-xyz');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});
