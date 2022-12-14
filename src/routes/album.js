const express = require('express');
const albumController = require('../controllers/album');
const storeInMemory = require('../middleware/multer');

const router = express.Router();

router.post(
  '/',
  storeInMemory.fields([
    {
      name: 'image',
      maxCount: 1,
    },
    {
      name: 'audio',
    },
  ]),
  albumController.addAlbum
);

module.exports = router;
