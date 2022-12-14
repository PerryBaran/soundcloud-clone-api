const { User } = require('../models');

const checkAlbumData = async (req, res, next) => {
  const { files: { audio }, body: { songName, userId } } = req;

  try {
    const user = await User.findByPk(userId, {
      raw: true,
    });

    if (!user) {
      return res.status(404).send({ message: 'User does not exist'});
    }

    const songArray = Array.isArray(songName);

    if (songArray) {
      if (songName.length > audio.length) {
        return res.status(404).send({ message: 'More song names than audio files' });
      }

      if (songName.length < audio.length) {
        return res.status(404).send({ message: 'More audio files than song names' });
      }      
    }

    if (!songArray && audio.length !== 1) {
      return res.status(404).send({ message: 'More audio files than song names' });
    }

    next();
  } catch (err) {
    res.status(500).send({ message: "server error"});
  }
};

module.exports = checkAlbumData;