// src/routes/api/index.js

const express = require('express');
const router = express.Router();

// our routes
router.get('/fragments', require('./get'));

module.exports = router;
