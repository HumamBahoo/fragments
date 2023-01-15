// src/server.js

// we want to gracefully shutdown our server.
const stoppable = require('stoppable');

// get our logger instance.
const logger = require('./logger');

// get our express app instance
const app = require('./app');

// get desired port from the process env. default to '8080'
const port = parseInt(process.env.PORT || 8080, 10);

// start a server listening on this port
const server = stoppable(
  app.listen(port, () => {
    // log a message showing that server has started, and which port it's using.
    logger.info({ port }, `Server started`);
  })
);

// export our server instance so other parts of our code can access it if required
module.exports = server;
