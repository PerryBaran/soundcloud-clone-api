const express = require('express');
const songController = require('../controllers/song');
const storeInMemory = require('../middleware/multer');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth.authenticateToken, storeInMemory.single('audio'), songController.create);

module.exports = router;
