const express = require('express');
const { createShortUrl, redirectToOriginal } = require('../controllers/urlController');

const router = express.Router();

router.post('/api/url/shorten', createShortUrl);

// Must stay last so it doesn't catch the routes above
router.get('/:code', redirectToOriginal);

module.exports = router;
