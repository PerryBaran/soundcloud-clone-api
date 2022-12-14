module.exports = (connection, DataTypes) => {
  const schema = {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      allowEmpty: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Must provide an album name',
        },
        notEmpty: {
          args: true,
          msg: 'The album name cannot be empty',
        },
      },
    },
  };

  const scope = {
    defaultScope: {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    },
  };

  return connection.define('Album', schema, scope);
};