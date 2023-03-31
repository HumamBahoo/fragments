// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../src/app');
const hash = require('../../src/hash');

const { Fragment } = require('../../src/model/fragment');

const resetData = async (user) => {
  const fragmentsIds = await Fragment.byUser(hash(user));

  if (fragmentsIds.length > 0) {
    fragmentsIds.forEach(async (id) => {
      await Fragment.delete(hash(user), id);
    });
  }
};

describe('GET /v1/fragments', () => {
  // clean up after each test
  afterEach(async () => {
    await resetData('user1@email.com');
  });

  test('unauthenticated requests are denied', async () => {
    const res = await request(app).get('/v1/fragments');
    expect(res.statusCode).toBe(401);
  });

  test('incorrect credentials are denied', async () => {
    const res = await request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password');

    expect(res.statusCode).toBe(401);
  });

  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('all user fragments id should be retrieved in an array', async () => {
    const fragmentId1 = (
      await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain')
        .send('This is fragment1')
    ).body.fragment.id;

    const fragmentId2 = (
      await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain')
        .send('This is fragment2')
    ).body.fragment.id;

    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    const resFragments = res.body.fragments;

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(resFragments[0]).toBe(fragmentId1);
    expect(resFragments[1]).toBe(fragmentId2);
  });

  test('returns an empty array if user has no fragments', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    const resFragment = res.body.fragments;

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(resFragment)).toBe(true);
    expect(resFragment.length).toBe(0);
  });
});

describe('GET /v1/fragments?expand=1', () => {
  // clean up after each test
  afterEach(async () => {
    await resetData('user1@email.com');
  });

  test('result should includes full representation of fragments metadata', async () => {
    const fragmentId1 = (
      await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain')
        .send('This is fragment1')
    ).body.fragment.id;

    const fragmentId2 = (
      await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain')
        .send('This is fragment2')
    ).body.fragment.id;

    const res = await request(app).get('/v1/fragments?expand=1').auth('user1@email.com', 'password1');
    const resFragments = res.body.fragments;

    expect(res.statusCode).toBe(200);
    expect(resFragments[0].id).toBe(fragmentId1);
    expect(resFragments[1].id).toBe(fragmentId2);
  });

  test('returns an empty array if user has no fragments', async () => {
    const res = await request(app).get('/v1/fragments?expand=1').auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments.length).toBe(0);
  });
});

describe('GET /v1/fragments/:id', () => {
  // clean up after each test
  afterEach(async () => {
    await resetData('user1@email.com');
  });

  test('unauthenticated requests are denied', async () => {
    const res = await request(app).get('/v1/fragments/id');
    expect(res.statusCode).toBe(401);
  });

  test('incorrect credentials are denied', async () => {
    const res = await request(app).get('/v1/fragments/id').auth('invalid@email.com', 'incorrect_password');

    expect(res.statusCode).toBe(401);
  });

  test('requesting a non-existent fragment should throw', async () => {
    const res = await request(app).get('/v1/fragments/no-such-id').auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
  });

  test('requesting an existent fragment should return its data', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a fragment');

    const createdFragmentId = postResponse.body.fragment.id;

    const res = await request(app).get(`/v1/fragments/${createdFragmentId}`).auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.text).toBe('This is a fragment');
  });

  test('incompatible fragment conversion should throw', async () => {
    const data = '# Markdown';

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/markdown')
      .send(data);

    const createdFragmentId = postResponse.body.fragment.id;

    const res = await request(app).get(`/v1/fragments/${createdFragmentId}.gif`).auth('user1@email.com', 'password1');

    expect(res.status).toBe(415);
    expect(res.body.error.code).toBe(415);
    expect(res.body.error.message).toBeDefined;
  });

  test('an md fragment can be converted to html', async () => {
    const data = '# Markdown';

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/markdown')
      .send(data);

    const createdFragmentId = postResponse.body.fragment.id;

    const res = await request(app).get(`/v1/fragments/${createdFragmentId}.html`).auth('user1@email.com', 'password1');
    expect(res.status).toBe(200);
    expect(res.text).toBe('<h1>Markdown</h1>\n');
  });
});

describe('GET /v1/fragments/:id/info', () => {
  // clean up after each test
  afterEach(async () => {
    await resetData('user1@email.com');
  });

  test('return an existing fragment data', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment1');

    const postedFragmentId = postResponse.body.fragment.id;

    const res = await request(app).get(`/v1/fragments/${postedFragmentId}/info`).auth('user1@email.com', 'password1');

    const resFragment = res.body.fragment;

    expect(res.status).toBe(200);
    expect(resFragment.id).toEqual(postedFragmentId);
    expect(typeof resFragment).toBe('object');
  });

  test('requesting a non-existent fragment should throw', async () => {
    const res = await request(app).get(`/v1/fragments/non-existent/info`).auth('user1@email.com', 'password1');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe(404);
    expect(res.body.error.message).toBeDefined;
  });
});
