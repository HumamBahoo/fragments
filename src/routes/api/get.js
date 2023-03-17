// src/routes/api/get.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
var md = require('markdown-it')();

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
module.exports.getFragmentDataById = async (req, res) => {
  const [fragmentId, extension] = req.params.id.split('.');
  const ownerId = req.user;

  logger.info({ fragmentId, ownerId, extension }, `Calling GET ${req.originalUrl}`);

  try {
    const fragment = await Fragment.byId(ownerId, fragmentId);
    const fragmentType = fragment.mimeType;
    logger.debug({ fragment, fragmentType }, 'Requested fragment was found');

    const rawData = await fragment.getData();
    logger.debug({ rawData }, 'Fragment data has been retrieved');

    // attempt to convert if conversion extension was provided
    if (extension) {
      const extensionContentType = getExtensionContentType(extension);
      logger.debug({ from: fragmentType, to: extensionContentType }, 'Converting fragment');

      if (fragment.formats.includes(extensionContentType)) {
        // TODO: Convert and send.
        // For now our logic only supports converting md to html.
        // Later the else condition should be removed as rawData
        // will never be returned here

        let convertedData;

        if (fragmentType == 'text/markdown' && extension == 'html') {
          convertedData = md.render(rawData.toString());

          logger.info('Fragment data was converted');

          return res.status(200).set('Content-Type', extensionContentType).send(convertedData);
        } else {
          return res.status(200).set('Content-Type', fragmentType).send(rawData);
        }
      } else {
        const errorResponse = createErrorResponse(415, `a ${fragmentType} fragment cannot be return as a ${extension}`);
        logger.error({ errorResponse }, 'Invalid extension/conversion');
        return res.status(415).json(errorResponse);
      }
    }
    // send raw data
    else {
      return res.status(200).set('Content-Type', fragmentType).send(rawData);
    }
  } catch (err) {
    const errorResponse = createErrorResponse(404, err.message);
    logger.error({ errorResponse }, 'Failed to retrieve requested fragment data');
    return res.status(404).json(errorResponse);
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

// get extension respective content-type
const getExtensionContentType = (extension) => {
  switch (extension) {
    case 'txt':
      return 'text/plain';
    case 'md':
      return 'text/markdown';
    case 'html':
      return 'text/html';
    case 'json':
      return 'application/json';
    case 'png':
      return 'image/png';
    case 'jpg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return null;
  }
};
