// src/routes/api/get.js

const response = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  const data = {
    fragments: [],
  };

  const createSuccessResponse = response.createSuccessResponse(data);

  res.status(200).json(createSuccessResponse);
};
