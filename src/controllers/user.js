const bcrypt = require('bcrypt');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const helpers = require('./helpers');
const s3 = require('../aws/s3');

const EXPIRES_IN = 1 * 24 * 60 * 60 * 1000;

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
      const token = jwt.sign(
        { id: user.id, name: user.name },
        process.env.JWT_SECRETKEY,
        {
          expiresIn: EXPIRES_IN,
        }
      );

      res
        .status(201)
        .cookie('userToken', token, { maxAge: EXPIRES_IN })
        .send(user);
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
    const user = await User.unscoped().findOne({ where: { email } });

    if (user) {
      const passwordsMatch = await bcrypt.compare(password, user.password);

      if (passwordsMatch) {
        let token = jwt.sign(
          { id: user.id, name: user.name },
          process.env.JWT_SECRETKEY,
          {
            expiresIn: EXPIRES_IN,
          }
        );

        res
          .status(201)
          .cookie('userToken', token, { maxAge: EXPIRES_IN })
          .send(user);
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

exports.readAll = async (_, res) => {
  try {
    await helpers.readAll(res, 'user');
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

exports.delete = async (req, res) => {
  const { params: { userId, password }, user: { id } } = req;

  try {
    if (id != userId) {
      return res.status(401).send({ message: 'Invalid Credentials' });
    }
    const user = await User.unscoped().findByPk(id, {
      raw: true,
    });

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) return res.status(401).send({ message: 'Invalid Credentials'});

    await s3.deleteDirectory(userId);
    
    const deletedRows = await User.destroy({ where: { id } });

    if (!deletedRows) {
      res.status(404).json({ message: `The User could not be found.` });
    } else {
      res.status(204).send();
    }
    
  } catch (err) {
    console.error(err);
  }
};