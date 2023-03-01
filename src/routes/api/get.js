// src/routes/api/get.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

// Get a list of fragments for the current user
module.exports.listUserFragments = (req, res) => {
  logger.info('Calling GET /v1/fragments');

  // TODO: this is just a place holder to get something working
  const successResponse = createSuccessResponse({
    status: 'ok',
    fragments: [],
  });

  res.status(200).json(successResponse);
};

// Get fragment data by Id
module.exports.getFragmentDataById = async (req, res) => {
  const fragmentId = req.params.id;
  const ownerId = req.user;

  logger.info({ fragmentId, ownerId }, 'Calling GET /v1/fragments/:id');

  try {
    const fragment = await Fragment.byId(ownerId, fragmentId);
    const fragmentData = await fragment.getData();
    const fragmentType = fragment.mimeType;

    res.set('Content-Type', fragmentType);
    res.set('Access-Control-Expose-Headers', 'Location');

    // TODO: If the extension used represents an unknown or unsupported type,
    // or if the fragment cannot be converted to this type, an HTTP 415 error
    // is returned instead, with an appropriate message. For example, a plain
    // text fragment cannot be returned as a PNG.

    res.status(200).send(fragmentData.toString());
  } catch (err) {
    const errorResponse = createErrorResponse(404, err.message);
    res.status(404).json(errorResponse);
  }
};
