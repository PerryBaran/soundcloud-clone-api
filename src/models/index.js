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

  connection.sync({ alter: true });
  return {
    User,
    Album,
    Song,
  };
};

module.exports = setupDatabase();
