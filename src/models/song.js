module.exports = (connection, DataTypes) => {
  const schema = {
    id : {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
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
      type: DataTypes.INTEGER,
      allowNull: false,
      allowEmpty: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Must provide a song position',
        },
        notEmpty: {
          args: true,
          msg: 'The position cannot be empty',
        },
      },
    },
  };

  const scope = {
    defaultScope: {
      attributes: { exclude: ['updatedAt'] },
    },
  };

  return connection.define('Songs', schema, scope);
};
