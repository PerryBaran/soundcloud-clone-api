const { Album } = require('../models');
const helpers = require('./helpers');

exports.create = async (req, res) => {
  try {
    await helpers.createFile(req, res, 'album');
  } catch (err) {
    console.error(err);
  }
};

exports.readAll = async (req, res) => {
  try {
    await helpers.readAll(req, res, 'album');
  } catch (err) {
    console.error(err);
  }
};

exports.delete = async (req, res) => {
  const {  albumId } = req.params;

  try {
    const { key } = await Album.findByPk(albumId, {
      raw: true,
    });


    await helpers.delete(key, albumId, res, 'album');
  } catch (err) {
    console.error(err);
  }
};