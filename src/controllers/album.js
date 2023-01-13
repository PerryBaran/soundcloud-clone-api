const { Album } = require('../models');
const s3 = require('../aws/s3');
const helpers = require('./helpers');

exports.create = async (req, res) => {
  const { file, body, user } = req;
  body.UserId = user.id;

  try {
    const response = await Album.create(body);

    if (!file) return res.status(200).send(response);

    const directory = `${user.id}/${response.id}`;
    const url = await s3.uploadFile(file, directory);
    const [updatedRows] = await Album.update({ url }, { where: { id: response.id } });
    
    if (updatedRows) {
      response.url = url;
      res.status(200).send(response);
    } else {
      res.status(404).send({ message: `error uploading file` });
    }
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

    if (album.UserId !== id)
      return res.status(401).send({ message: 'Invalid Credentials' });

    const directory = `${id}/${albumId}`;
    await helpers.patch(body, albumId, res, 'album', file, directory);
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

    const directory = `${id}/${albumId}`;

    await s3.deleteDirectory(directory);

    await helpers.delete(albumId, res, 'album');
  } catch (err) {
    console.error(err);
  }
};
