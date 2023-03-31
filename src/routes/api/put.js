// src/routes/api/put.js

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// Post /fragments
module.exports.putFragment = async (req, res, next) => {
  logger.info(`Calling PUT ${req.originalUrl}`);
  res.send('This is a PUT request');
};
