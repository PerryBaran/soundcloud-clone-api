module.exports = (connection, DataTypes) => {
  const schema = {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      allowEmpty: false,
      unique: {
        args: true,
        msg: 'This username is already in use',
      },
      validate: {
        notNull: {
          args: true,
          msg: 'Must provide a username',
        },
        notEmpty: {
          args: true,
          msg: 'The username cannot be empty',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      allowEmpty: false,
      unique: {
        args: true,
        msg: 'This email is already in use',
      },
      validate: {
        notNull: {
          args: true,
          msg: 'Must provide an email',
        },
        isEmail: {
          args: true,
          msg: 'Email must be valid',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Must provide a password',
        },
      },
    },
  };

  const scope = {
    defaultScope: {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    },
  };

  return connection.define('Users', schema, scope);
};
