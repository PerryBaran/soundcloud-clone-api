const bcrypt = require('bcrypt');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const helpers = require('./helpers');
const s3 = require('../aws/s3');

const EXPIRES_IN = 1 * 24 * 60 * 60 * 1000;

const sendToken = (res, user) => {
  const token = jwt.sign(
    { id: user.id, name: user.name },
    process.env.JWT_SECRETKEY,
    {
      expiresIn: EXPIRES_IN,
    }
  );

  delete user.dataValues.password;
  user.dataValues.userToken = token;

  res.status(201).send(user);
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const data = {
      name,
      email,
      password: await bcrypt.hash(password, 10),
    };

    const user = await User.create(data);

    if (user) {
      sendToken(res, user);
    } else {
      res.status(409).send({ message: 'Details are not correct' });
    }
  } catch (err) {
    res.status(500).send({ message: `Server error: ${err.message}` });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(401).send({ message: 'Authentication failed' });

    const user = await User.unscoped().findOne({ where: { email } });

    if (user) {
      const passwordsMatch = await bcrypt.compare(password, user.password);

      if (passwordsMatch) {
        sendToken(res, user);
      } else {
        res.status(401).send({ message: 'Authentication failed' });
      }
    } else {
      res.status(401).send({ message: 'Authentication failed' });
    }
  } catch (err) {
    res.status(500).send({ message: `Server error: ${err.message}` });
  }
};

exports.readAll = async (req, res) => {
  const { query } = req;

  try {
    await helpers.readAll(query, res, 'user');
  } catch (err) {
    console.error(err);
  }
};

exports.readById = async (req, res) => {
  const { userId } = req.params;

  try {
    await helpers.readById(userId, res, 'user');
  } catch (err) {
    console.error(err);
  }
};

exports.patch = async (req, res) => {
  const {
    body,
    params: { userId },
    user: { id },
  } = req;

  if (userId !== id)
    return res.status(401).send({ message: 'Invalid Credentials' });

  try {
    const { name, email, password } = body;
    const data = {
      name,
      email,
      password: password && await bcrypt.hash(password, 10),
    }

    await helpers.patch(data, id, res, 'user');
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: err.message ? `Error: ${err.message}` : 'Unexpected error',
    });
  }
};

exports.delete = async (req, res) => {
  const {
    params: { userId, password },
    user: { id },
  } = req;

  try {
    if (userId !== id) {
      return res.status(401).send({ message: 'Invalid Credentials' });
    }
    const user = await User.unscoped().findByPk(id, {
      raw: true,
    });

    if (!user)
      return res.status(404).json({ message: 'The User could not be found.' });

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch)
      return res.status(401).send({ message: 'Invalid Credentials' });

    await s3.deleteDirectory(userId);

    await helpers.delete(userId, res, 'user')
  } catch (err) {
    res.status(500).send({
      message: err.message ? `Error: ${err.message}` : 'Unexpected error',
    });
  }
};
