const { Album } = require('../models');
const helpers = require('./helpers');

exports.create = async (req, res) => {
  try {
    await helpers.createFile(req, res, 'album');
  } catch (err) {
    console.error(err);
  }
};

exports.readAll = async (_, res) => {
  try {
    await helpers.readAll(res, 'album');
  } catch (err) {
    console.error(err);
  }
};

exports.readById = async (req, res) => {
  const { albumId } = req.params;

  try {
    await helpers.readById(albumId, res, 'album');
  } catch (err) {
    console.error(err);
  }
};

exports.delete = async (req, res) => {
  const { params: { albumId }, user: { id } } = req;

  try {
    const { url } = await Album.findByPk(albumId, {
      raw: true,
    });

    await helpers.delete(url, id, albumId, res, 'album');
  } catch (err) {
    console.error(err);
  }
};
