// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// get version and author from package.json file.
const { version, author } = require('../package.json');

const logger = require('./logger');
const pino = require('pino-http')({
  // use our already configured default logger instance.
  logger,
});

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

// define a simple health check route. if server is running,
// we'll respond with a 200 OK. else the server isn't healthy.
app.get('/', (req, res) => {
  // client shouldn't cache this response (always request it fresh)
  // See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#controlling_caching
  res.setHeader('Cache-Control', 'no-cache');

  // send a 200 'OK' response with info about our repo
  res.status(200).json({
    status: 'ok',
    author,
    githubUrl: 'https://github.com/humambahoo/fragments',
    version,
  });
});

// add 404 middleware to handle requests for resources that don't exist.
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      message: 'not found',
      code: 404,
    },
  });
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

  res.status(status).json({
    status: 'error',
    error: {
      message,
      code: status,
    },
  });
});

// export 'app', so we can access it in server.js.
module.exports = app;