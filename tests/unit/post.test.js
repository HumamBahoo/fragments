// tests/unit/post.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('POST /fragments', () => {
  test('unauthenticated requests should be denied', async () => {
    const res = await request(app).post('/v1/fragments');

    expect(res.statusCode).toBe(401);
  });

  test('incorrect credentials should be denied', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password');

    expect(res.statusCode).toBe(401);
  });

  test('authenticated users can create a plain text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    expect(res.statusCode).toBe(201);
  });

  test('requests with invalid media type should throw', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'invalid')
      .send('This is a fragment');

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe('invalid media type');
  });

  test('requests with an unsupported media types should throw', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'media/jpeg')
      .send('This is a fragment');

    expect(res.statusCode).toBe(415);
    expect(res.body.error.message).toBe('unsupported media type');
  });

  test('A successful response should include status, and a fragment object', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined;
  });

  test('A successful response fragment object should include all necessary properties', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    const resFragment = res.body.fragment;

    expect(resFragment.ownerId).toBe('user1@email.com');
    expect(resFragment.created).toBeDefined;
    expect(resFragment.updated).toBeDefined;
    expect(resFragment.size).toEqual('This is a fragment'.length);
    expect(resFragment.type).toBe('text/plain');
    expect(resFragment.id).toMatch(
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
    );
  });

  test('response header should have the right properties', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a fragment');

    expect(res.status).toEqual(201);
    expect(res.get('content-type')).toBe('application/json; charset=utf-8');
    expect(res.get('content-length')).toHaveLength;
    expect(res.get('Location')).toBe(
      `${process.env.API_URL}:${process.env.PORT}/v1/fragments/${res.body.fragment.id}`
    );
  });
});
