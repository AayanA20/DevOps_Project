import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';

test('GET /health returns healthy status code 200', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'healthy');
  assert.ok(res.body.timestamp);
});

test('GET /api/health returns service identification', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.service, 'Mini Instagram API');
});

test('GET / returns API welcome info and route index', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Mini Instagram REST API');
  assert.ok(res.body.documentation.auth);
  assert.ok(res.body.documentation.posts);
  assert.ok(res.body.documentation.users);
});

test('POST /api/auth/register with missing fields returns 400', async () => {
  const res = await request(app).post('/api/auth/register').send({});
  assert.equal(res.status, 400);
  assert.equal(res.body.message, 'Username, email and password are required');
});

test('POST /api/auth/login with empty fields returns 400', async () => {
  const res = await request(app).post('/api/auth/login').send({ email: '', password: '' });
  assert.equal(res.status, 400);
  assert.equal(res.body.message, 'Email and password are required');
});

test('GET non-existent route returns 404', async () => {
  const res = await request(app).get('/api/unknown-endpoint');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});
