const express = require('express');
const songController = require('../controllers/song');
const storeInMemory = require('../middleware/multer');
const auth = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .post(
    auth.authenticateToken,
    storeInMemory.single('audio'),
    songController.create
  )
  .get(songController.readAll);

router
  .route('/:songId')
  .get(songController.readById)
  .delete(auth.authenticateToken, songController.delete);

module.exports = router;
