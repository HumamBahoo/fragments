// src/routes/api/post.js

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// Post /fragments
module.exports.postFragment = async (req, res) => {
  if (Buffer.isBuffer(req.body)) {
    const reqOwnerId = req.user;
    const reqContentType = req.get('content-type');

    // create, set, and save the new fragment
    const newFragment = new Fragment({ ownerId: reqOwnerId, type: reqContentType });
    newFragment.setData(req.body);
    newFragment.save();

    // setting response headers: 'Location'
    if (process.env.API_URL == undefined) {
      res.set('Location', `${req.headers.host}/v1/fragments/${newFragment.id}`);
    } else {
      res.set(
        'Location',
        `${process.env.API_URL}:${process.env.PORT}/v1/fragments/${newFragment.id}`
      );
    }

    res.set('Access-Control-Expose-Headers', 'Location');

    const successResponse = createSuccessResponse({ fragment: newFragment });
    res.status(201).send(successResponse);

    logger.debug(res, 'A new fragment has been created');
  } else {
    const errorResponse = createErrorResponse(415, 'unsupported media type');
    res.status(415).json(errorResponse);

    logger.error('Unable to create a new fragment', errorResponse);
  }
};
