const { Song } = require('../models');
const helpers = require('./helpers');

exports.create = async (req, res) => {
  try {
    await helpers.createFile(req, res, 'song');
  } catch (err) {
    console.error(err);
  }
};

exports.readAll = async (req, res) => {
  try {
    await helpers.readAll(req, res, 'song');
  } catch (err) {
    console.error(err);
  }
};

exports.delete = async (req, res) => {
  const { songId } = req.params;

  try {
    const { key, } = await Song.findByPk(songId, {
      raw: true,
    });

    await helpers.delete(key, songId, res, 'song');
  } catch (err) {
    console.error(err);
  }
};