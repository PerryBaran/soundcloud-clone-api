const { createFile } = require('./helpers');

exports.create = async (req, res) => {
  try {
    await createFile(req, res, 'song');
  } catch (err) {
    console.error(err);
  }
};
