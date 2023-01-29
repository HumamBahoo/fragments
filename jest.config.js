// jest.config.js

// get full path to env.jest file
const path = require('path');
const envFile = path.join(__dirname, 'env.jest');

// read the environment variables for Jest from the env.jest file
require('dotenv').config({ path: envFile });

// log a message to remind developers to see more details from log messages
console.log(`Using LOG_LEVEL=${process.env.LOG_LEVEL}. Use 'debug' in env.jest for more details`);

// set Jest options, see: https://jestjs.io/docs/configuration
module.exports = {
  verbose: true,
  testTimeout: 5000,
};
