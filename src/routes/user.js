const express = require('express');
const userController = require('../controllers/user');
const auth = require('../middleware/auth');

const router = express.Router();

router.route('/').get(userController.readAll);

/*
router
  .route('/:userId')
  .get(userController.readById)
  .patch(auth.authenticateToken, userController.patch);

router.delete(
  '/:userId/:password',
  auth.authenticateToken,
  userController.delete
);
*/

router.post('/signup', auth.checkCredentials, userController.signup);

router.post('/login', userController.login);

module.exports = router;
