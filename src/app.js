const express = require('express');
const userRouter = require('./routes/user');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/users', userRouter);

module.exports = app;
