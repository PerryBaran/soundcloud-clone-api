const db = require('../models');
const User = db.User;

const saveUser = async (req, res, next) => {
  try {
    const username = await User.findOne({
      where: {
        name: req.body.name,
      },
    });

    if (username) {
      return res.status(409).send({ error: 'Username already taken' });
    }

    const emailcheck = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (emailcheck) {
      return res.status(409).send({ error: 'Authentication failed' });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: `Server error: ${err.message}` });
  }
};

module.exports = {
  saveUser,
};
