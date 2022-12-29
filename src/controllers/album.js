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
  const { query } = req;

  try {
    await helpers.readAll(query, res, 'album');
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

exports.patch = async (req, res) => {
  const {
    body,
    file,
    params: { albumId },
    user: { id },
  } = req;

  try {
    const album = await Album.findByPk(albumId, {
      raw: true,
    });

    if (!album)
      return res.status(404).send({ message: 'The album could not be found' });

    if (album.UserId != id)
      return res.status(401).send({ message: 'Invalid Credentials' });

    await helpers.patch(body, albumId, res, 'album', file);
  } catch (err) {
    console.error(err);
  }
};

exports.delete = async (req, res) => {
  const {
    params: { albumId },
    user: { id },
  } = req;

  try {
    const album = await Album.findByPk(albumId, {
      raw: true,
    });

    if (!album)
      return res.status(404).send({ message: 'The album could not be found' });

    await helpers.delete(album.url, id, albumId, res, 'album');
  } catch (err) {
    console.error(err);
  }
};
