// src/model/data/index.js

/**
 * Pick the appropriate back-end data strategy
 */

// memory strategy
module.exports = process.env.AWS_REGION ? require('./aws') : require('./memory');

// TODO: add other strategies here, when implemented
