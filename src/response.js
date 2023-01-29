// src/response.js

/* successful response:
 * {
 *    "status":"ok"
 *    .....
 * }
 */
module.exports.createSuccessResponse = function (data) {
  return {
    status: 'ok',
    // use the spread operator to clone data 'data' into our object, see:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals
    ...data,
  };
};

/* error response:
 * {
 *    "status":"error",
 *    "error": {
 *      "code":400,
 *      "message": "invalid request, missing...",
 *    }
 * }
 */
module.exports.createErrorResponse = function (code, message) {
  return {
    status: 'error',
    error: {
      code: code,
      message: message,
    },
  };
};
