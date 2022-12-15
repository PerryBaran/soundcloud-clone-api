const { createFile } = require('./helpers');

exports.create = async (req, res) => {
  const { file, body } = req;

  try {
    await createFile(body, file, res, 'album');
  } catch (err) {
    console.error(err);
  }
};
