// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // TODO: we'll need to add tests to check the contents of the fragments array later
  test('unauthenticated users requesting a fragment by id are denied', async () => {
    const res = await request(app).get(`/v1/fragments/1234`);
    expect(res.statusCode).toBe(401);
  });

  test('authenticated users requesting an existing fragment by id should succeed', async () => {
    const createdFragment = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a fragment');

    const res = await request(app)
      .get(`/v1/fragments/${createdFragment.body.id}`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(res.get('content-length')).toHaveLength;
    expect(res.text).toBe('This is a fragment');
  });

  test('authenticated users requesting a fragment that does not exist in db should get an error', async () => {
    const res = await request(app).get(`/v1/fragments/1234`).auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
    expect(res.body.error.message).toBe('Fragment with id: 1234 not found in db');
  });
});
