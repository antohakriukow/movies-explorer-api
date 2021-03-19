const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { NotFound } = require('./utils/constants');
const NotFoundError = require('./errors/NotFoundError');

const { createUser, login } = require('./controllers/users');
const { checkUser } = require('./middlewares/validation');
const auth = require('./middlewares/auth');

const { PORT = config.get('port') } = process.env;
const { mongoUri = config.get('mongoUri') } = process.env;

const app = express();

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(express.json({ extended: true }));
app.use(cors());

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signup', checkUser, createUser);
app.post('/signin', checkUser, login);

app.use('/users', auth, require('./routes/users'));
app.use('/movies', auth, require('./routes/movie'));

app.use(errorLogger);

app.use(errors());

app.use('*', () => {
  throw new NotFoundError(NotFound);
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  console.log(err);
  res.status(statusCode).json({
    message: statusCode === 500
      ? 'На сервере произошла ошибка'
      : message,
  });
  next();
});

app.listen(PORT, () => {
  console.log(`App has been started on port ${PORT}...`);
});
