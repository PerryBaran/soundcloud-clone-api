const { Album } = require('../models');
const helpers = require('./helpers');

exports.create = async (req, res) => {
  try {
    await helpers.createFile(req, res, 'album');
  } catch (err) {
    console.error(err);
  }
};

exports.delete = async (req, res) => {
  const {  albumId } = req.params;

  try {
    const { key, UserId } = await Album.findByPk(albumId, {
      raw: true,
    });

    const filePath = `${UserId}/${key}`;

    await helpers.delete(filePath, albumId, res, 'album');
  } catch (err) {
    console.error(err);
  }
};