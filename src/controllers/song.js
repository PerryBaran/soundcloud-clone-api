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
  const {
    body,
    file,
    params: { songId },
    user: { id },
  } = req;

  try {
    const song = await Song.findByPk(songId, {
      raw: true,
    });

    if (!song) return res.status(404).send({ message: "The song could not be found"});

    const album = await Album.findByPk(song.AlbumId, {
      raw: true,
    });

    if (!album) return res.status(404).send({ message: "The album could not be found"});

    if (album.UserId != id)
      return res.status(401).send({ message: 'Invalid Credentials' });

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
    const song  = await Song.findByPk(songId, {
      raw: true,
    });

    if(!song) return res.status(404).send({ message: "The album could not be found"});

    await helpers.delete(song.url, id, songId, res, 'song');
  } catch (err) {
    console.error(err);
  }
};
