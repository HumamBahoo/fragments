// src/routes/api/post.js

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// Post /fragments
module.exports.postFragment = async (req, res) => {
  if (Buffer.isBuffer(req.body)) {
    logger.info('Creating a new fragment');

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
      res.set('Location', `${process.env.API_URL}/v1/fragments/${newFragment.id}`);
    }

    res.set('Access-Control-Expose-Headers', 'Location');

    const successResponse = createSuccessResponse({ fragment: newFragment });
    res.status(201).send(successResponse);

    logger.info('The new fragment has been created and added to db');
  } else {
    const errorResponse = createErrorResponse(415, 'unsupported media type');
    res.status(415).json(errorResponse);

    logger.error({ errorResponse }, 'Unable to create a new fragment');
  }
};
