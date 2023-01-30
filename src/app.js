// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const logger = require('./logger');
const pino = require('pino-http')({
  // use our already configured default logger instance.
  logger,
});
const passport = require('passport');
const authenticate = require('./authorization/index');
const response = require('./response');

// create an express app instance we can use to attach middleware and HTTP routes.
const app = express();

// use logging middleware.
app.use(pino);

// use security middleware.
app.use(helmet());

// use CORS middleware to make requests across origins.
app.use(cors());

// use gzip/deflate compression middleware.
app.use(compression());

// Set up our passport authentication middleware
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Define our routes
app.use('/', require('./routes'));

// add 404 middleware to handle requests for resources that don't exist.
app.use((req, res) => {
  // create an error response with the details
  const createErrorResponse = response.createErrorResponse(404, 'not found');
  res.status(404).json(createErrorResponse);
});

// add error-handling middleware to deal with anything else.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // there maybe an error response we can use already, if not, use
  // a generic 500 server error and message.
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  // if this a server error, log something, so we can see what's going on.
  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  const createErrorResponse = response.createErrorResponse(status, message);
  res.status(status).json(createErrorResponse);
});

// export 'app', so we can access it in server.js.
module.exports = app;
