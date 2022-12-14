const { uploadFileToS3 } = require("../aws/uploadS3");
const { Album, Song } = require('../models');

const addAlbum = async (req, res) => {
  const { files: { image, audio }, body: { albumName, songName, userId } } = req;
  try {
    let imageRef = null;
    const songs = [];

    if (image) {
      for (const file of image) {
        imageRef = await uploadFileToS3(file);
      }      
    }

    if (Array.isArray(audio)) {
      const { length } = audio;

      for (let i = 0; i < length; i += 1) {
        const url = await uploadFileToS3(audio[i]);
        songs.push({
          name: songName[i],
          audioRef: url,
          position: i,
        });
      }      
    } else {
      const url = await uploadFileToS3(audio);
      songs.push({
        songName,
        audioRef: url,
        position: 0
      });
    }

    const album = await Album.create({
      name: albumName,
      imageRef,
      UserId: userId,
    });

    let songResponse = [];
    for (const { name, audioRef, position } of songs) {
      const song = await Song.create({
        name,
        audioRef,
        position,
        AlbumId: album.id
      });

      songResponse.push(song);
    }

    const response = { album, songResponse };

    res.status(200).send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message ? `Error: ${err.message}` : 'Unexpted Error' })
  }
};


module.exports = {
  addAlbum,
};
