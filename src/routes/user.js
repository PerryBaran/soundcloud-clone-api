const express = require('express');
const userController = require('../controllers/user');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/signup', auth.checkCredentials, userController.signup);

router.post('/login', userController.login);

module.exports = router;
