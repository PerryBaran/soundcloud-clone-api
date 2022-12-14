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
    audioRef: {
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
    artRef: {
      type: DataTypes.STRING,
      allowNull: false,
      allowEmpty: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Must provide an art file',
        },
        notEmpty: {
          args: true,
          msg: 'The art file cannot be empty',
        },
      },
    },
  };

  const scope = {
    defaultScope: {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    },
  };

  return connection.define('Song', schema, scope);
};
