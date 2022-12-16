const Sequelize = require('sequelize');
const UserModel = require('./user');
const AlbumModel = require('./album');
const SongModel = require('./song');

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

const setupDatabase = () => {
  const connection = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false,
  });

  const User = UserModel(connection, Sequelize);
  const Album = AlbumModel(connection, Sequelize);
  const Song = SongModel(connection, Sequelize);

  User.hasMany(Album, {
    foreignKey: {
      allowNull: false,
      validate: {
        notNull: {
          args: [true],
          msg: 'Album must have a User',
        },
      },
    },
  });
  Album.belongsTo(User);

  Album.hasMany(Song, {
    foreignKey: {
      allowNull: false,
      validate: {
        notNull: {
          args: [true],
          msg: 'Song must have an Album',
        },
      },
    },
  });
  Song.belongsTo(Album);

  connection.sync({ alter: true });
  return {
    User,
    Album,
    Song,
  };
};

module.exports = setupDatabase();
