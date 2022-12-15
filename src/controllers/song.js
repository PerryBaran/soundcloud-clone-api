const { createFile } = require('./helpers');

exports.create = async (req, res) => {
  const { file, body } = req;

  try {
    await createFile(body, file, res, 'song');
  } catch (err) {
    console.error(err);
  }
};
