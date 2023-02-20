// src/logger.js

// use 'info' as our standard log level if not specified
const options = { level: process.env.LOG_LEVEL || 'info' };

// make logs easier to read using pino-pretty, if we're using 'debug' logging
if (options.level === 'debug') {
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  };
}

// export Pino Logger instance
module.exports = require('pino')(options);
