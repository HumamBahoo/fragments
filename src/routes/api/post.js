// src/routes/api/post.js

const response = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  // if buffer data in request body is valid
  if (Buffer.isBuffer(req.body)) {
    // create fragment and set its data
    const fragment = new Fragment({ ownerId: req.user, type: req.get('content-type') });
    fragment.save();
    fragment.setData(req.body);

    // set response Location
    if (process.env.API_URL == undefined) {
      res.set('Location', `${req.headers.host}/v1/fragments/${fragment.id}`);
    } else {
      res.set('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    }

    const successResponse = response.createSuccessResponse(fragment);

    return res.status(201).json(successResponse);
  }
  // if buffer is with an invalid media type
  else {
    const errorResponse = response.createErrorResponse(415, 'invalid media type');

    return res.status(415).json(errorResponse);
  }
};
