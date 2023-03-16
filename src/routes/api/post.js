// src/routes/api/post.js

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// Post /fragments
module.exports.postFragment = async (req, res, next) => {
  logger.info(`Calling POST ${req.originalUrl}`);

  if (Buffer.isBuffer(req.body)) {
    const ownerId = req.user;
    const contentType = req.get('Content-Type');
    const data = req.body;

    const createdFragment = new Fragment({ ownerId: ownerId, type: contentType });

    try {
      await createdFragment.setData(data);
      await createdFragment.save();
    } catch (err) {
      next(err);
    }

    // setup and send response
    let baseUrl;
    process.env.API_URL ? (baseUrl = process.env.API_URL) : (baseUrl = req.headers.host);

    res.set('Location', `${baseUrl}/v1/fragments/${createdFragment.id}`);
    res.set('Access-Control-Expose-Headers', 'Location');

    const successResponse = createSuccessResponse({ fragment: createdFragment });
    logger.info({ successResponse }, `Success creating a new fragment`);
    res.status(201).json(successResponse);
  } else {
    const errorResponse = createErrorResponse(415, 'unsupported media type');
    logger.error({ errorResponse }, 'Unsupported media type');
    res.status(415).json(errorResponse);
  }
};
