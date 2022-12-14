const { uploadFileToS3 } = require("../aws/uploadS3");
const { Album, Song } = require('../models');

const addAlbum = async (req, res) => {
  const { files } = req;
  try {
    let imageRef = null;
    const songs = [];

    for (const image of files.image) {
      imageRef = await uploadFileToS3(image);
    }

    for (const audio of files.audio) {
      const url = await uploadFileToS3(audio);
      songs.push({
        name: audio.originalname.split('.')[0],
        audioRef: url
      });
    }

    const data = {
      imageRef,
      songs
    }

    res.status(200).send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message ? `Error: ${err.message}` : 'Unexpted Error'})
  }
};


module.exports = {
  addAlbum,
};
