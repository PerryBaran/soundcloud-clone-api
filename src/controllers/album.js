const addAlbum = async (req, res) => {
  console.log(req.files);
  res.status(200).send();
};

module.exports = {
  addAlbum,
};
