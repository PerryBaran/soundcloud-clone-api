const express = require('express');
const albumController = require('../controllers/album');
const storeInMemory = require('../middleware/multer');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth.authenticateToken, storeInMemory.single('image'), albumController.create);

router.delete('/:albumId', auth.authenticateToken, albumController.delete);

module.exports = router;
