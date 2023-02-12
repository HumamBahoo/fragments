// src/routes/api/get.js

const response = require('../../response');
const { Fragment } = require('../../model/fragment');
/**
 * Get a list of fragments for the current user
 */
module.exports.get = (req, res) => {
  const data = {
    fragments: [],
  };

  const createSuccessResponse = response.createSuccessResponse(data);

  res.status(200).json(createSuccessResponse);
};

module.exports.getById = async (req, res) => {
  if (req.params.id == 'not-found') {
    return res.status(404).json(response.createErrorResponse(404, 'not found'));
  }

  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    const fragmentData = await fragment.getData();

    if (fragment.isText) {
      res.set('content-type', fragment.mimeType);
      res.status(200).send(fragmentData.toString());
    } else {
      // TODO
    }
  } catch (err) {
    return res.status(404).json(response.createErrorResponse(404, err.message));
  }
};
