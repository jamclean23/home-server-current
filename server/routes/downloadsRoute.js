// Routes for downloading files

// ====== IMPORTS ======

const express = require('express');
const router = express.Router();

// Controller
const controller = require('../controllers/downloadsController.js');

// ====== ROUTES ======

router.use('/:slug', controller.downloadFile);


// ====== EXPORTS ======

module.exports = router;