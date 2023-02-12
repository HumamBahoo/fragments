// tests/unit/post.test.js

const request = require('supertest');
const app = require('../../src/app');
const hash = require('../../src/hash');

describe('POST /v1/fragments', () => {
  test('unauthenticated requests should be denied', async () => {
    const res = await request(app).post('/v1/fragments');
    expect(res.status).toEqual(401);
  });

  test('incorrect credentials should be denied', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password');
    expect(res.status).toEqual(401);
  });

  test('authenticated user can create a plain text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a fragment');
    expect(res.status).toEqual(201);
  });

  test('request has no body', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send();
    expect(res.status).toEqual(500);
  });

  test('invalid media type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'invalid')
      .send('This is a fragment');
    expect(res.status).toEqual(500);
  });

  test('unsupported media type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/jpeg')
      .send('This is a fragment');
    expect(res.status).toEqual(415);
  });

  test('response body should include all necessary properties', async () => {
    const hashedEmail = hash('user1@email.com');

    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a fragment');
    expect(res.body.status).toBe('ok');
    expect(res.body.ownerId).toBe(hashedEmail);
    expect(res.body.type).toBe('text/plain');
    expect(res.body.size).toEqual('This is a fragment'.length);
    expect(res.body.created).toBeDefined;
    expect(res.body.updated).toBeDefined;
    expect(res.body.id).toMatch(
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
    expect(res.get('Location')).toBe(`${process.env.API_URL}/v1/fragments/${res.body.id}`);
    expect(res.get('content-length')).toHaveLength;
  });
});
