const multer = require('multer');

const fileFilter = (_, file, cb) => {
  const { fieldname, mimetype } = file;
  const type = mimetype.split('/')[0];

  if (
    (fieldname === 'image' && type === 'image') ||
    (fieldname === 'audio' && type === 'audio')
  ) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
  }
};

const storeInMemory = multer({ storage: multer.memoryStorage(), fileFilter });

module.exports = storeInMemory;
