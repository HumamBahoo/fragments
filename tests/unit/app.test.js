// tests/unit/app.test.js

// // add 404 middleware to handle requests for resources that don't exist.
// app.use((req, res) => {
//   res.status(404).json({
//     status: 'error',
//     error: {
//       message: 'not found',
//       code: 404,
//     },
//   });
// });

const request = require('supertest');

const app = require('../../src/app');

describe('Handle 404', () => {
  test('unauthenticated users requesting nonexistent page should return 401', async () => {
    const res = await request(app).get('/v1/fragments/not-found');
    expect(res.statusCode).toBe(401);
  });

  test('authenticated users requesting nonexistent page should return 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/not-found')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('not found');
  });
});
