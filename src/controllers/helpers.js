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


exports.createFile = async (req, res, model) => {
  const { file, body, user } = req;

  if (!file) return res.status(400).send({ message: 'file required' });

  const Model = getModel(model);

  try {
    const key = await s3.uploadFile(file, user.id);
    
    body.key = key;

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

exports.delete = async (filePath, id, res, model) => {
  const Model = getModel(model);
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
