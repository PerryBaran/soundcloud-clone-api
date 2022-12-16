module.exports = (connection, DataTypes) => {
  const schema = {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      allowEmpty: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Must provide a song name',
        },
        notEmpty: {
          args: true,
          msg: 'The song name cannot be empty',
        },
      },
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      allowEmpty: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Must provide an audio file',
        },
        notEmpty: {
          args: true,
          msg: 'The audio file cannot be empty',
        },
      },
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
      allowEmpty: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Must provide a song position',
        },
        notEmpty: {
          args: true,
          msg: 'The provide a song position',
        },
      },
    },
  };

  const scope = {
    defaultScope: {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    },
  };

  return connection.define('Songs', schema, scope);
};
