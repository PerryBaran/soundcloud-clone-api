const express = require('express');
const songController = require('../controllers/song');
const storeInMemory = require('../middleware/multer');

const router = express.Router();

router.post(
  '/',
  storeInMemory.single('audio'),
  songController.create
);

module.exports = router;
