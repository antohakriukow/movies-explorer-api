const router = require('express').Router();
const {
  checkId,
  checkProfile,
} = require('../middlewares/validation');

const {
  getUser,
  getMe,
  updateProfile,
} = require('../controllers/users');

router.get('/me', getMe);
router.patch('/me', checkProfile, updateProfile);

router.get('/:id', checkId, getUser);

module.exports = router;
