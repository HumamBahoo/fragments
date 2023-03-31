// src/routes/api/post.js

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// Post /v1/fragments
module.exports.postFragment = async (req, res, next) => {
  logger.info(`Calling POST ${req.originalUrl}`);

  if (Buffer.isBuffer(req.body)) {
    const ownerId = req.user;
    const contentType = req.get('Content-Type');
    const data = req.body;

    const newFragment = new Fragment({ ownerId: ownerId, type: contentType });

    try {
      await newFragment.setData(data);
      await newFragment.save();

      // setup baseUrl
      let baseUrl;
      process.env.API_URL ? (baseUrl = process.env.API_URL) : (baseUrl = req.headers.host);

      // setup response
      res.set('Location', `${baseUrl}/v1/fragments/${newFragment.id}`);
      res.set('Access-Control-Expose-Headers', 'Location');

      // send response
      const successResponse = createSuccessResponse({ fragment: newFragment });
      logger.info({ successResponse }, 'A new fragment has been created');

      return res.status(201).json(successResponse);
    } catch (err) {
      next(err);
    }
  } else {
    const errorResponse = createErrorResponse(415, 'unsupported media type');
    logger.error({ errorResponse }, 'Invalid data');
    return res.status(415).json(errorResponse);
  }
};
