const express = require('express');
const userRouter = require('./routes/user');
const albumRouter = require('./routes/album');
const songRouter = require('./routes/song');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: 'https://localhost:3000',
  exposedHeaders: ['set-cookie'],
}));

app.use('/users', userRouter);
app.use('/albums', albumRouter);
app.use('/songs', songRouter);

// needs all 4 parameters defined even if unusead to work
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_UNEXPECTED_FILE': {
        return res.status(400).send({ message: 'File is wrong type' });
      }
      case 'LIMIT_FILE_SIZE': {
        return res
          .status(400)
          .send({
            message:
              'File size is too large, images must be smaller then 5MB and songs smaller than 100MB',
          });
      }
      case 'LIMIT_FILE_COUNT': {
        return res.status(400).send({ message: 'File limit reached' });
      }
      default: {
        break;
      }
    }
  }
  return res.status(400).send({
    error: err.message ? `Unexpeted Error: ${err.message}` : 'Unexpected error',
  });
});

module.exports = app;
