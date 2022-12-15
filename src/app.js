const express = require('express');
const userRouter = require('./routes/user');
const albumRouter = require('./routes/album');
const songRouter = require('./routes/song');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/users', userRouter);
app.use('/albums', albumRouter);
app.use('/songs', songRouter)

// needs all 4 parameters defined even if unusead to work
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).send({ error: "File is wrong type"});
    }
  } 
  return res.status(400).send({ error: err.message ? `Unexpeted Error: ${err.message}` : 'Unexpected error'});
});

module.exports = app;
