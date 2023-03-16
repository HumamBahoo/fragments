// src/routes/api/get.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

// Get a list of fragments for the current user
module.exports.listUserFragments = async (req, res, next) => {
  const ownerId = req.user;
  let expand = false;

  // validate if expand is set to true
  if (req.query['expand'] == '1') {
    expand = true;
  }

  logger.info({ ownerId, expand }, `Calling GET ${req.originalUrl}`);

  // retrieve user fragments
  try {
    const foundFragments = await Fragment.byUser(ownerId, expand);

    const successResponse = createSuccessResponse({ fragments: foundFragments });

    if (foundFragments.length == 0) {
      logger.info('User has no fragments');
    } else {
      logger.info({ foundFragments }, 'User fragments have been retrieved');
    }

    return res.status(200).json(successResponse);
  } catch (err) {
    logger.error({ err }, "Failed to retrieve user's fragments");
    next(err);
  }
};

// Get fragment data by Id
module.exports.getFragmentDataById = async (req, res, next) => {
  const fragmentId = req.params.id;
  const ownerId = req.user;

  let foundFragment;
  let fragmentType;

  logger.info({ fragmentId, ownerId }, `Calling GET ${req.originalUrl}`);

  // get the fragment
  try {
    foundFragment = await Fragment.byId(ownerId, fragmentId);
    logger.debug({ foundFragment }, 'Fragment was found');
  } catch (err) {
    const errorResponse = createErrorResponse(404, err.message);
    logger.error({ errorResponse }, 'Failed to retrieve requested fragment');
    return res.status(404).json(errorResponse);
  }

  // validate if conversion can happen
  try {
    fragmentType = foundFragment.mimeType;

    // TODO: validate If the extension used represents an unknown or unsupported type,
    // or if the fragment cannot be converted to this type
    // TODO: if not valid, return an error such as `<fragment-type> fragment cannot be returned as a <conversion-type>`
  } catch (err) {
    const errorResponse = createErrorResponse(415, err.message);
    logger.error({ errorResponse }, 'Fragment cannot be converted');
    return res.status(415).json(errorResponse);
  }

  // get the data, convert (if possible), and return the converted fragment or its raw data
  try {
    const fragmentData = await foundFragment.getData();
    logger.debug({ fragmentData }, 'Fragment was retrieved');

    res.set('Content-Type', fragmentType);
    res.set('Access-Control-Expose-Headers', 'Location');

    res.status(200).send(fragmentData.toString());
  } catch (err) {
    logger.error({ err }, 'Error retrieving fragment data');
    next(err);
  }
};

module.exports.getFragmentInfoById = async (req, res) => {
  const fragmentId = req.params.id;
  const ownerId = req.user;

  let foundFragment;

  logger.info({ fragmentId, ownerId }, `Calling GET ${req.originalUrl}`);

  // get the fragment
  try {
    foundFragment = await Fragment.byId(ownerId, fragmentId);
    logger.debug({ foundFragment }, 'Fragment was found');

    const successResponse = createSuccessResponse({ fragment: foundFragment });
    res.status(200).json(successResponse);
  } catch (err) {
    const errorResponse = createErrorResponse(404, err.message);
    logger.error({ errorResponse }, 'Failed to retrieve requested fragment');
    return res.status(404).json(errorResponse);
  }
};
