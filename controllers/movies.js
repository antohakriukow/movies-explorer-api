const Movie = require('../models/movie');

const AuthError = require('../errors/AuthError');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');

const {
  NotFound,
  NotYourMovie,
} = require('../utils/constants');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .populate('user')
    .then((movies) => res.json(movies))
    .catch(next);
};

module.exports.addMovie = (req, res, next) => {
  const {
    country, director, duration, year, description, image, trailer, thumbnail,
    movieId, nameRU, nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    owner: req.user._id,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.status(201).json(movie))
    .catch(() => next(new BadRequestError()));
};

module.exports.removeMovie = (req, res, next) => {
  Movie.findByIdAndRemove(req.params.id)
    .orFail(new NotFoundError(NotFound))
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        throw new AuthError(NotYourMovie);
      }
      movie.remove()
        .then((deletingMovie) => res.json(deletingMovie));
    })
    .catch(next);
};
