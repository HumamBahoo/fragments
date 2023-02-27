// tests/unit/response.test.js

const { createErrorResponse, createSuccessResponse } = require('../../src/response');

// Define (i.e., name) the set of tests we're about to do
describe('API responses', () => {
  test('createErrorResponse()', () => {
    const errorResponse = createErrorResponse(404, 'not found');

    expect(errorResponse).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: 'not found',
      },
    });
  });

  test('createSuccessResponse() with no arg passed', () => {
    const successResponse = createSuccessResponse();

    expect(successResponse).toEqual({
      status: 'ok',
    });
  });

  test('createSuccessResponse(data)', () => {
    const successResponse = createSuccessResponse({ a: 1, b: 2 });

    expect(successResponse).toEqual({
      status: 'ok',
      a: 1,
      b: 2,
    });
  });
});
