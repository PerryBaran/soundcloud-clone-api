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

const getUserId = async (model, data, res) => {
  try {
    switch (model) {
      case 'album': {
        const { UserId } = await User.findByPk(data.UserId, {
          raw: true,
        });
        return UserId;
      }
      case 'song': {
        const { UserId } = await Album.findByPk(data.AlbumId, {
          raw: true,
        });
        return UserId;
      }
      default:
        throw new Error('cannot find userId');
    }
  } catch (err) {
    res.status(404).send({ message: 'Cannot find User' });
  }
};

exports.createFile = async (data, file, res, model) => {
  const Model = getModel(model);

  try {
    const UserId = await getUserId(model, data, res);
    const key = await s3.uploadFileToS3(file, UserId);
    data.key = key;
    const response = await Model.create(data);
    res.status(200).send(response);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({
        message: err.message ? `Error: ${err.message}` : 'Unexpected error',
      });
  }
};
