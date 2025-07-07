const express = require('express');
const router  = express.Router();
const { getTrackingData, getETA } = require('../controllers/trackingController');

router.get('/:code',       getTrackingData);
router.get('/:code/eta',   getETA);

module.exports = router;
