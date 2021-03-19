const router = require('express').Router();
const { checkMovie, checkId } = require('../middlewares/validation');

const {
  getMovies,
  addMovie,
  removeMovie,
} = require('../controllers/movies');

router.get('/', getMovies);
router.post('/', checkMovie, addMovie);
router.delete('/:id', checkId, removeMovie);

module.exports = router;
