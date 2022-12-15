const express = require('express');
const albumController = require('../controllers/album');
const storeInMemory = require('../middleware/multer');

const router = express.Router();

router.post('/', storeInMemory.single('image'), albumController.create);

module.exports = router;
