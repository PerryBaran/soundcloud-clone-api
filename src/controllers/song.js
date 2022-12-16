const { Song, Album } = require('../models');
const helpers = require('./helpers');

exports.create = async (req, res) => {
  try {
    await helpers.createFile(req, res, 'song');
  } catch (err) {
    console.error(err);
  }
};

exports.readAll = async (_, res) => {
  try {
    await helpers.readAll(res, 'song');
  } catch (err) {
    console.error(err);
  }
};

exports.readById = async (req, res) => {
  const { songId } = req.params;

  try {
    await helpers.readById(songId, res, 'song');
  } catch (err) {
    console.error(err);
  }
};

exports.patch = async (req, res) => {
  const { body, file, params: { songId }, user: { id } } = req;

  try {
    const { AlbumId } = await Song.findByPk(songId, {
      raw: true,
    });

    const { UserId } = await Album.findByPk(AlbumId, {
      raw: true,
    });

    if (UserId != id) return res.status(401).send({ message: 'Invalid Credentials' });

    await helpers.patch(body, songId, res, 'song', file);
  } catch (err) {
    console.error(err);
  }
};

exports.delete = async (req, res) => {
  const {
    params: { songId },
    user: { id },
  } = req;

  try {
    const { url } = await Song.findByPk(songId, {
      raw: true,
    });

    await helpers.delete(url, id, songId, res, 'song');
  } catch (err) {
    console.error(err);
  }
};
