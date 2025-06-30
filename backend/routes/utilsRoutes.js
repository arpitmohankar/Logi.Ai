const express = require('express');
const router = express.Router();
const { autocompleteAddress, geocode } = require('../controllers/utilsController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/autocomplete', autocompleteAddress);
router.post('/geocode', geocode);

module.exports = router;
