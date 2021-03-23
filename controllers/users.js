const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/user');
const {
  NotFound,
  IncorrectRequest,
  UserExists,
  WrongAuthData,
} = require('../utils/constants');

const UnauthorizedError = require('../errors/UnauthorizedError');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

const { JWT_SECRET = config.get('jwtSecret') } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      if (users) {
        res.json({ users });
      }
      throw new NotFoundError(NotFound);
    })
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.id).select('+password')
    .orFail(new BadRequestError(IncorrectRequest))
    .then((user) => res.json(user))
    .catch(next);
};

module.exports.getMe = (req, res, next) => {
  const userId = mongoose.Types.ObjectId(req.user._id);
  User.findById(userId)
    .orFail(new BadRequestError(IncorrectRequest))
    .then((user) => res.json(user))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name, about, email, password: hash, avatar,
      })
        .then((user) => res.status(201).json({
          data: {
            _id: user._id,
            email: user.email,
          },
        }))
        .catch((e) => {
          if (e.code === 11000) {
            next(new ConflictError(UserExists));
          } else next(e);
        });
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { email, name },
    { new: true, runValidators: true },
  )
    .orFail(new BadRequestError(NotFound))
    .then((user) => res.json(user))
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        JWT_SECRET,
        { expiresIn: '7d' },
      );
      res.status(200).json({ token });
    })
    .catch(() => next(new UnauthorizedError(WrongAuthData)));
};
