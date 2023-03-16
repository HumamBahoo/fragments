// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../src/app');
const hash = require('../../src/hash');
const { Fragment } = require('../../src/model/fragment');

describe('GET /v1/fragments', () => {
  test('unauthenticated requests are denied', async () => {
    const res = await request(app).get('/v1/fragments');
    expect(res.statusCode).toBe(401);
  });

  test('incorrect credentials are denied', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password');

    expect(res.statusCode).toBe(401);
  });

  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('all user fragments id should be retrieved in an array', async () => {
    const fragment1 = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment1');

    const fragment2 = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment2');

    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments.length).toBe(2);

    // deleting created fragments
    await Fragment.delete(hash('user1@email.com'), res.body.fragments[0]);
    await Fragment.delete(hash('user1@email.com'), res.body.fragments[1]);
  });
});

describe('GET /v1/fragments?expand=1', () => {
  test('result includes full representation of fragments metadata', async () => {
    const fragment1 = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment1');

    const fragment2 = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment2');

    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments[0].id).toBe(fragment1.body.fragment.id);
    expect(res.body.fragments[1].id).toBe(fragment2.body.fragment.id);

    // deleting created fragments
    await Fragment.delete(hash('user1@email.com'), res.body.fragments[0].id);
    await Fragment.delete(hash('user1@email.com'), res.body.fragments[1].id);
  });
});

describe('GET /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', async () => {
    const res = await request(app).get('/v1/fragments/id');
    expect(res.statusCode).toBe(401);
  });

  test('incorrect credentials are denied', async () => {
    const res = await request(app)
      .get('/v1/fragments/id')
      .auth('invalid@email.com', 'incorrect_password');

    expect(res.statusCode).toBe(401);
  });

  test('requesting a non-existent fragment should throw', async () => {
    const res = await request(app)
      .get('/v1/fragments/no-such-id')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
  });

  test('requesting an existent fragment should return its data', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a fragment');

    const createdFragmentId = postResponse.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${createdFragmentId}`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.text).toBe('This is a fragment');
  });
});

describe('GET /v1/fragments/:id/info', () => {
  test('TODO', async () => {
    // TODO
  });
});
