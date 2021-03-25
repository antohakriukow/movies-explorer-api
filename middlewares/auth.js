const jwt = require('jsonwebtoken');
const config = require('config');

const { JWT_SECRET = config.get('jwtSecret') } = process.env;

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const { authorization = '' } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Нет авторизации' });
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ message: 'Нет авторизации' });
  }

  req.user = payload;
  return next();
};
