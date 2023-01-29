// test/unit/response.test.js

const { createSuccessResponse, createErrorResponse } = require('../../src/response');

// define (i.e, name) the set of tests we're about to do
describe('API Response', () => {
  // test for calling createErrorResponse()
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

  // test for calling createSuccessResponse() with no argument
  test('createSuccessResponse()', () => {
    // no arg passed
    const successResponse = createSuccessResponse();
    // expected result
    expect(successResponse).toEqual({
      status: 'ok',
    });
  });

  //test for calling createSuccessResponse() with an argument
  test('createSuccessResponse(data)', () => {
    // arg data to include
    const data = { a: 1, b: 2 };
    const successResponse = createSuccessResponse(data);
    // expected result
    expect(successResponse).toEqual({
      status: 'ok',
      a: 1,
      b: 2,
    });
  });
});
