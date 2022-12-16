const express = require('express');
const albumController = require('../controllers/album');
const storeInMemory = require('../middleware/multer');
const auth = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .post(
    auth.authenticateToken,
    storeInMemory.single('image'),
    albumController.create
  )
  .get(albumController.readAll);

router
  .route('/:albumId')
  .get(albumController.readById)
  .delete(auth.authenticateToken, albumController.delete);

module.exports = router;
