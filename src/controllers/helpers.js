const { User, Album, Song } = require('../models');
const s3 = require('../aws/s3');

const getModel = (model) => {
  const models = {
    user: User,
    album: Album,
    song: Song,
  };

  return models[model];
};

const getOptions = (model) => {
  switch (model) {
    case 'user':
      return {
        include: [
          {
            model: Album,
            include: [
              {
                model: Song,
              },
            ],
          },
        ],
      };
    case 'album':
      return {
        include: [
          {
            model: User,
          },
          {
            model: Song,
          },
        ],
      };
    case 'song':
      return {
        include: [
          {
            model: Album,
            include: [
              {
                model: User,
              },
            ],
          },
        ],
      };
    default:
      return {};
  }
};

exports.createFile = async (req, res, model) => {
  const { file, body, user } = req;

  if (!file) return res.status(400).send({ message: 'file required' });

  const Model = getModel(model);

  try {
    const url = await s3.uploadFile(file, user.id);

    body.url = url;

    if (model === 'album') {
      body.UserId = user.id;
    }

    const response = await Model.create(body);
    res.status(200).send(response);
  } catch (err) {
    if (err.message === 'Cannot find User') {
      return res.status(404).send({ message: err.message });
    }
    res.status(500).send({
      message: err.message ? `Error: ${err.message}` : 'Unexpected error',
    });
  }
};

exports.readAll = async (res, model) => {
  const Model = getModel(model);
  const options = getOptions(model);

  try {
    const response = await Model.findAll(options);

    res.status(200).send(response);
  } catch (err) {
    res.status(500).send({
      message: err.message ? `Error: ${err.message}` : 'Unexpected error',
    });
  }
};

exports.readById = async (id, res, model) => {
  const Model = getModel(model);
  const options = getOptions(model);

  try {
    const response = await Model.findByPk(id, options);

    if (!response) {
      res.status(404).send({ message: `The ${model} could not be found.` });
    } else {
      res.status(200).json(response);
    }
  } catch (err) {
    res.status(500).send({
      message: err.message ? `Error: ${err.message}` : 'Unexpected error',
    });
  }
};

exports.delete = async (url, userId, id, res, model) => {
  const Model = getModel(model);
  const filePath = url.split('.com/')[1];
  if (userId != filePath.split('/')[0])
    return res.status(401).send({ message: 'Invalid Credentials' });

  try {
    await s3.deleteFile(filePath);
    const deletedRows = await Model.destroy({ where: { id } });

    if (!deletedRows) {
      res.status(404).json({ message: `The ${model} could not be found.` });
    } else {
      res.status(204).send();
    }
  } catch (err) {
    res.status(500).send({
      message: err.message ? `Error: ${err.message}` : 'Unexpected error',
    });
  }
};
