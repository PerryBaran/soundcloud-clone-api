const bcrypt = require('bcrypt');
const db = require('../models');
const jwt = require('jsonwebtoken');

const EXPIRES_IN = 1 * 24 * 60 * 60 * 1000;
const User = db.User;

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) {
      return res.status(400).send({ error: 'Name must have a value' });
    }

    if (!email) {
      return res.status(400).send({ error: 'Email must have a value' });
    }

    if (!email.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)) {
      return res.status(400).send({ error: 'Email must be valid' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .send({ error: 'Password must be atleast 8 characters long' });
    }

    const data = {
      name,
      email,
      password: await bcrypt.hash(password, 10),
    };

    const user = await User.create(data);

    if (user) {
      const token = jwt.sign({ id: user.id }, process.env.SECRETKEY, {
        expiresIn: EXPIRES_IN,
      });

      res.cookie('jwt', token, { maxAge: EXPIRES_IN, httpOnly: true });
      res.status(201).send(user);
    } else {
      res.status(409).send({ error: 'Details are not correct' });
    }
  } catch (err) {
    res.status(500).send({ error: `Server error: ${err.message}` });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (user) {
      const passwordsMatch = await bcrypt.compare(password, user.password);

      if (passwordsMatch) {
        let token = jwt.sign({ id: user.id }, process.env.SECRETKEY, {
          expiresIn: EXPIRES_IN,
        });

        res.cookie('jwt', token, { maxAge: EXPIRES_IN, httpOnly: true });
        res.status(201).send(user);
      } else {
        res.status(401).send({ error: 'Authentication failed' });
      }
    } else {
      res.status(401).send({ error: 'Authentication failed' });
    }
  } catch (err) {
    res.status(500).send({ error: `Server error: ${err.message}` });
  }
};

module.exports = {
  signup,
  login,
};
