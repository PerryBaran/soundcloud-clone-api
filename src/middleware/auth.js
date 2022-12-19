const { User } = require('../models');
const jwt = require('jsonwebtoken');

exports.checkCredentials = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name) {
      return res.status(400).send({ message: 'Name must have a value' });
    }

    if (!email) {
      return res.status(400).send({ message: 'Email must have a value' });
    }

    if (!email.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)) {
      return res.status(400).send({ message: 'Email must be valid' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .send({ message: 'Password must be atleast 8 characters long' });
    }

    const username = await User.findOne({
      where: {
        name,
      },
    });

    if (username) {
      return res.status(409).send({ message: 'Username already taken' });
    }

    const emailcheck = await User.findOne({
      where: {
        email,
      },
    });

    if (emailcheck) {
      return res.status(409).send({ message: 'Authentication failed' });
    }

    next();
  } catch (err) {
    res.status(500).send({ message: `Server error: ${err.message}` });
  }
};

exports.authenticateToken = (req, res, next) => {
  const token = req.headers.usertoken;

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRETKEY, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
};
