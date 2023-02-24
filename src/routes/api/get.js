// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');

// Get a list of fragments for the current user
module.exports.getFragments = (req, res) => {
  // TODO: this is just a place holder to get something working
  const successResponse = createSuccessResponse({
    status: 'ok',
    fragments: [],
  });

  res.status(200).json(successResponse);
};
